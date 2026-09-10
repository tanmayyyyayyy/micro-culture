import express from "express";
import OpenAI from "openai";
import { requireAuth } from "../middleware/auth.js";
import { aiLimiter, cultureGenerateLimiter } from "../middleware/rateLimit.js";
import Culture from "../models/Culture.js";
import DailyRitual from "../models/DailyRitual.js";
import RitualLog from "../models/RitualLog.js";

const router = express.Router();

// AI client — uses Groq if GROQ_API_KEY is set, falls back to OpenAI
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
  baseURL:
    process.env.GROQ_BASE_URL ||
    (process.env.GROQ_API_KEY ? "https://api.groq.com/openai/v1" : undefined),
});
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Defensive JSON parser — models sometimes wrap output in ```json fences or
 * add stray prose. Strip fences, extract JSON object, then try/catch.
 */
function parseJSONResponse(raw) {
  if (!raw) throw new Error("Empty AI response");
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch {
        // fall through
      }
    }
    throw new Error("AI response was not valid JSON: " + raw.slice(0, 300));
  }
}

/**
 * Validate a culture blueprint from the AI.
 * Returns a sanitised object; throws if critically malformed.
 */
function validateBlueprint(raw) {
  if (typeof raw !== "object" || raw === null) throw new Error("Blueprint is not an object");
  return {
    aesthetic: Array.isArray(raw.aesthetic) ? raw.aesthetic.slice(0, 8).map(String) : [],
    values: Array.isArray(raw.values) ? raw.values.slice(0, 8).map(String) : [],
    jargon: Array.isArray(raw.jargon) ? raw.jargon.slice(0, 12).map(String) : [],
    rituals: Array.isArray(raw.rituals) ? raw.rituals.slice(0, 12).map(String) : [],
    symbol: typeof raw.symbol === "string" ? raw.symbol.slice(0, 10) : "✨",
  };
}

/**
 * Validate a structured daily ritual from the AI.
 * Returns a sanitised object; throws if critically malformed.
 */
function validateStructuredRitual(raw) {
  if (typeof raw !== "object" || raw === null) throw new Error("Ritual is not an object");
  if (!raw.title || typeof raw.title !== "string") throw new Error("Ritual missing title");
  if (!raw.description || typeof raw.description !== "string") throw new Error("Ritual missing description");

  return {
    title: raw.title.slice(0, 120),
    description: raw.description.slice(0, 600),
    instructions: Array.isArray(raw.instructions)
      ? raw.instructions.slice(0, 8).map((s) => String(s).slice(0, 300))
      : [],
    durationMinutes:
      Number.isInteger(raw.durationMinutes) && raw.durationMinutes > 0
        ? Math.min(raw.durationMinutes, 480)
        : null,
    difficulty: ["easy", "medium", "hard"].includes(raw.difficulty) ? raw.difficulty : "easy",
    reflectionPrompt: typeof raw.reflectionPrompt === "string" ? raw.reflectionPrompt.slice(0, 400) : "",
    reason: typeof raw.reason === "string" ? raw.reason.slice(0, 400) : "",
    // Legacy field for backward compat with existing frontend rendering
    ritualText: `${raw.title}: ${raw.description}`,
  };
}

// ---------------------------------------------------------------------------
// POST /ai/generate-culture (SEC-2: rate limited)
// ---------------------------------------------------------------------------
router.post("/generate-culture", requireAuth, cultureGenerateLimiter, async (req, res, next) => {
  try {
    const { name, description, vibeWords } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: "name and description are required" });
    }
    if (typeof name !== "string" || name.length > 120) {
      return res.status(400).json({ error: "name must be a string under 120 characters" });
    }
    if (typeof description !== "string" || description.length > 1000) {
      return res.status(400).json({ error: "description must be a string under 1000 characters" });
    }

    const vibeArr = Array.isArray(vibeWords)
      ? vibeWords.slice(0, 8).map(String)
      : [];

    const prompt = `You are designing a fictional "micro-culture" — a small community with its own identity, values, and traditions. Given the seed below, expand it into a structured blueprint.

Name: ${name}
Description: ${description}
Vibe words: ${vibeArr.join(", ") || "none provided"}

Return ONLY valid JSON, no prose, no code fences, matching this shape exactly:
{
  "aesthetic": ["3-6 short aesthetic keywords"],
  "values": ["3-6 core values, short phrases"],
  "jargon": ["4-8 invented slang/jargon terms formatted as 'term: meaning'"],
  "rituals": ["5-10 short ritual descriptions, each doable in a day, on-theme"],
  "symbol": "a single emoji that represents this culture"
}`;

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      response_format: { type: "json_object" },
    });

    const raw = parseJSONResponse(completion.choices[0].message.content);
    const blueprint = validateBlueprint(raw);
    res.json(blueprint);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /ai/daily-ritual/:cultureId — idempotent fetch of today's ritual
// Returns existing ritual if one exists for today, otherwise generates one.
// (SEC-3: membership check, SEC-2: rate limited)
// ---------------------------------------------------------------------------
router.get("/daily-ritual/:cultureId", requireAuth, aiLimiter, async (req, res, next) => {
  try {
    const { cultureId } = req.params;

    const culture = await Culture.findById(cultureId);
    if (!culture) return res.status(404).json({ error: "Culture not found" });

    // SEC-3: user must be a member of this culture
    const isMember = culture.members.some((m) => m.toString() === req.userId.toString());
    if (!isMember) {
      return res.status(403).json({ error: "You must be a member of this culture to view its rituals" });
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Return cached ritual if already generated today
    const existing = await DailyRitual.findOne({ cultureId, date: today });
    if (existing) return res.json(existing);

    // Generate a new ritual with full culture memory context
    const generated = await generateDailyRitual(culture, today);
    res.status(201).json(generated);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /ai/generate-ritual — kept for backward compat, delegates to shared logic
// (SEC-3: membership check, SEC-2: rate limited)
// ---------------------------------------------------------------------------
router.post("/generate-ritual", requireAuth, aiLimiter, async (req, res, next) => {
  try {
    const { cultureId } = req.body;
    if (!cultureId) return res.status(400).json({ error: "cultureId is required" });

    const culture = await Culture.findById(cultureId);
    if (!culture) return res.status(404).json({ error: "Culture not found" });

    // SEC-3: user must be a member
    const isMember = culture.members.some((m) => m.toString() === req.userId.toString());
    if (!isMember) {
      return res.status(403).json({ error: "You must be a member of this culture to generate rituals" });
    }

    const today = new Date().toISOString().slice(0, 10);
    const existing = await DailyRitual.findOne({ cultureId, date: today });
    if (existing) return res.json(existing);

    const generated = await generateDailyRitual(culture, today);
    res.status(201).json(generated);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Shared ritual generation function — builds full culture memory context
// and calls AI, then validates and persists the result.
// ---------------------------------------------------------------------------
async function generateDailyRitual(culture, today) {
  // --- Culture Memory: last 7 daily rituals (avoid repetition) ---
  const recentDailyRituals = await DailyRitual.find({ cultureId: culture._id })
    .sort({ date: -1 })
    .limit(7)
    .lean();

  // --- Culture Memory: last 20 member ritual logs (participation signals) ---
  const recentLogs = await RitualLog.find({ cultureId: culture._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("userId", "name")
    .lean();

  // --- Build compact context strings ---
  const recentRitualsText =
    recentDailyRituals.length > 0
      ? recentDailyRituals
          .map((r) => `[${r.date}] ${r.title || r.ritualText}`)
          .join("\n")
      : "No previous rituals yet — this is the first one.";

  const recentLogsText =
    recentLogs.length > 0
      ? recentLogs
          .map((l) => `- ${l.userId?.name || "a member"}: "${l.content.slice(0, 200)}"`)
          .join("\n")
      : "No member activity yet.";

  const prompt = `You generate one new daily ritual for a fictional micro-culture.

CULTURE IDENTITY
Name: ${culture.name}
Description: ${culture.description}
Values: ${culture.values.join(", ") || "none defined"}
Aesthetic: ${culture.aesthetic.join(", ") || "none defined"}
Terminology/Jargon: ${culture.jargon.join(", ") || "none defined"}

RECENT RITUALS (last 7 — do NOT simply repeat these):
${recentRitualsText}

RECENT MEMBER PARTICIPATION (last 20 logs — understand what members actually did):
${recentLogsText}

INSTRUCTIONS:
- Create ONE new sacred daily rite authentically grounded in this culture's specific identity, aesthetic, and values.
- Naturally incorporate 1-2 words from this culture's terminology/jargon into the title, description, or instructions.
- STRICTLY AVOID generic self-help/wellness clichés (e.g. "take a walk and reflect", "drink water and breathe") unless explicitly fundamental to this culture's identity. Every rite should feel uniquely native to this micro-culture.
- It must be distinct from all recent rituals listed above.
- It must be completable in a single day (practical, safe, legal, achievable within 5-45 minutes).
- Build upon or respond to recent member activity if logs exist, reinforcing cultural memory.
- Provide step-by-step instructions that feel participatory and ceremonial.
- In "reason", explain in 1-2 sentences why this rite was chosen today based on the culture's momentum or recent member reflections.

Return ONLY valid JSON with no prose and no code fences:
{
  "title": "short evocative ritual title (max 8 words)",
  "description": "1-3 sentences explaining the ritual and its cultural meaning",
  "instructions": ["step 1 (1-2 sentences)", "step 2", "step 3"],
  "durationMinutes": 15,
  "difficulty": "easy",
  "reflectionPrompt": "a single poignant question for members to reflect on after completing the ritual",
  "reason": "1-2 sentences: why this ritual was chosen given this culture's recent history and member logs"
}`;

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.85,
    response_format: { type: "json_object" },
  });

  const raw = parseJSONResponse(completion.choices[0].message.content);
  const validated = validateStructuredRitual(raw);

  // Persist — use upsert to safely handle rare race conditions where two
  // simultaneous requests both pass the "no existing" check.
  const dailyRitual = await DailyRitual.findOneAndUpdate(
    { cultureId: culture._id, date: today },
    { $setOnInsert: { cultureId: culture._id, date: today, ...validated } },
    { upsert: true, new: true }
  );

  return dailyRitual;
}

// ---------------------------------------------------------------------------
// POST /ai/weekly-summary (SEC-2: rate limited)
// ---------------------------------------------------------------------------
router.post("/weekly-summary", requireAuth, aiLimiter, async (req, res, next) => {
  try {
    const { cultureId } = req.body;
    if (!cultureId) return res.status(400).json({ error: "cultureId is required" });

    const culture = await Culture.findById(cultureId);
    if (!culture) return res.status(404).json({ error: "Culture not found" });

    // Membership check — only members can get their culture's summary
    const isMember = culture.members.some((m) => m.toString() === req.userId.toString());
    if (!isMember) {
      return res.status(403).json({ error: "You must be a member of this culture to view its summary" });
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const logs = await RitualLog.find({ cultureId, createdAt: { $gte: weekAgo } })
      .populate("userId", "name")
      .limit(100)
      .lean();

    if (!logs.length) {
      return res.json({ summary: "No activity logged this week yet.", ritualOfTheWeek: null });
    }

    const logText = logs
      .map((l) => `- ${l.userId?.name || "member"}: ${l.content.slice(0, 200)}`)
      .join("\n");

    const prompt = `Summarize this past week of activity in the "${culture.name}" micro-culture (values: ${culture.values.join(", ")}) in 2-4 sentences, capturing its mood and highlights. Then pick the single most representative or delightful log as "ritual of the week" and briefly explain why.

Logs:
${logText}

Return ONLY valid JSON, no prose:
{ "summary": "...", "ritualOfTheWeek": { "content": "...", "reason": "..." } }`;

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const result = parseJSONResponse(completion.choices[0].message.content);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
