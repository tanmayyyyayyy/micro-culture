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
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || "dummy-key-for-init",
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
 * Generic cliché words to reject when standing alone as values
 */
const CLICHE_VALUE_WORDS = new Set([
  "community",
  "growth",
  "creativity",
  "respect",
  "positivity",
  "inclusivity",
  "kindness",
  "learning",
  "teamwork",
  "collaboration",
]);

/**
 * Generic cliché words to reject when entire aesthetic is made of them
 */
const CLICHE_AESTHETIC_WORDS = new Set([
  "minimal",
  "modern",
  "clean",
  "beautiful",
  "cool",
  "aesthetic",
  "nice",
  "vibe",
]);

/**
 * Validate a culture blueprint from the AI.
 * Enforces uniqueness, jargon definitions, minimum counts, and anti-cliché constraints.
 * Returns a sanitised object; throws if critically malformed or non-compliant.
 */
function validateBlueprint(raw, { strict = false } = {}) {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Blueprint is not an object");
  }

  // Helper to deduplicate array of strings case-insensitively
  const cleanUniqueStrings = (arr, maxItems = 8) => {
    if (!Array.isArray(arr)) return [];
    const seen = new Set();
    const result = [];
    for (const item of arr) {
      if (typeof item !== "string") continue;
      const trimmed = item.trim();
      if (!trimmed) continue;
      const normalized = trimmed.toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        result.push(trimmed);
      }
    }
    return result.slice(0, maxItems);
  };

  const values = cleanUniqueStrings(raw.values, 6);
  if (values.length < 3) {
    throw new Error(`Blueprint requires at least 3 distinct values (found ${values.length})`);
  }

  // Check that values are not just single generic cliché words
  for (const val of values) {
    const singleWord = val.trim().toLowerCase();
    if (CLICHE_VALUE_WORDS.has(singleWord)) {
      throw new Error(`Value "${val}" is a generic cliché; values must be culturally contextualized`);
    }
  }

  // Jargon validation: must be unique terms and contain definition
  const rawJargon = Array.isArray(raw.jargon) ? raw.jargon : [];
  const jargon = [];
  const seenJargonTerms = new Set();

  for (const item of rawJargon) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed) continue;

    // Must have delimiter ":" or " - " separating term and definition
    const colonIdx = trimmed.indexOf(":");
    const dashIdx = trimmed.indexOf(" - ");
    const splitIdx = colonIdx !== -1 ? colonIdx : dashIdx;

    if (splitIdx === -1) {
      if (strict) {
        throw new Error(`Jargon item "${trimmed}" missing definition delimiter (expected 'term: definition')`);
      }
      continue;
    }

    const term = trimmed.slice(0, splitIdx).trim();
    const def = trimmed.slice(splitIdx + (colonIdx !== -1 ? 1 : 3)).trim();

    if (!term || def.length < 3) {
      if (strict) {
        throw new Error(`Jargon term "${term}" has insufficient or missing definition`);
      }
      continue;
    }

    const normTerm = term.toLowerCase();
    if (!seenJargonTerms.has(normTerm)) {
      seenJargonTerms.add(normTerm);
      jargon.push(`${term}: ${def}`);
    }
  }

  if (jargon.length < 3) {
    throw new Error(`Blueprint requires at least 3 defined jargon terms (found ${jargon.length})`);
  }

  // Rituals validation
  const rituals = cleanUniqueStrings(raw.rituals, 6);
  if (rituals.length < 3) {
    throw new Error(`Blueprint requires at least 3 distinct founding rituals (found ${rituals.length})`);
  }

  // Check that rituals are actionable and not generic platitudes
  for (const rit of rituals) {
    if (rit.length < 12) {
      throw new Error(`Ritual "${rit}" is too brief to be actionable; must describe a practice`);
    }
    const lower = rit.toLowerCase();
    if (
      lower.includes("reflect on your day") ||
      lower.includes("share your thoughts") ||
      lower.includes("take a deep breath")
    ) {
      throw new Error(`Ritual "${rit}" contains generic self-help clichés; must be culturally specific`);
    }
  }

  // Aesthetic validation
  const aesthetic = cleanUniqueStrings(raw.aesthetic, 6);
  if (aesthetic.length < 3) {
    throw new Error(`Blueprint requires at least 3 aesthetic keywords (found ${aesthetic.length})`);
  }

  const allClicheAesthetic = aesthetic.every((w) => CLICHE_AESTHETIC_WORDS.has(w.toLowerCase()));
  if (allClicheAesthetic) {
    throw new Error("Aesthetic codes must contain sensory, culture-specific keywords, not solely generic buzzwords");
  }

  // Symbol validation
  const symbol = typeof raw.symbol === "string" && raw.symbol.trim()
    ? raw.symbol.trim().slice(0, 10)
    : "✨";

  return {
    aesthetic,
    values,
    jargon: jargon.slice(0, 8),
    rituals,
    symbol,
  };
}

/**
 * Validate a structured daily ritual from the AI.
 * Returns a sanitised object; throws if critically malformed.
 */
function validateStructuredRitual(raw) {
  if (typeof raw !== "object" || raw === null) throw new Error("Ritual is not an object");
  if (!raw.title || typeof raw.title !== "string" || !raw.title.trim()) {
    throw new Error("Ritual missing title");
  }
  if (!raw.description || typeof raw.description !== "string" || !raw.description.trim()) {
    throw new Error("Ritual missing description");
  }

  const instructions = Array.isArray(raw.instructions)
    ? raw.instructions.slice(0, 8).map((s) => String(s).slice(0, 300).trim()).filter(Boolean)
    : [];

  const durationMinutes =
    Number.isInteger(raw.durationMinutes) && raw.durationMinutes > 0
      ? Math.min(raw.durationMinutes, 480)
      : (Number(raw.durationMinutes) > 0 && Number(raw.durationMinutes) <= 480 ? Math.round(Number(raw.durationMinutes)) : 15);

  const difficulty = ["easy", "medium", "hard"].includes(raw.difficulty) ? raw.difficulty : "easy";
  const reflectionPrompt = typeof raw.reflectionPrompt === "string" ? raw.reflectionPrompt.slice(0, 400).trim() : "";
  const reason = typeof raw.reason === "string" && raw.reason.trim()
    ? raw.reason.slice(0, 400).trim()
    : "Designed in resonance with recent member reflections and cultural momentum.";

  const title = raw.title.slice(0, 120).trim();
  const description = raw.description.slice(0, 600).trim();

  return {
    title,
    description,
    instructions: instructions.length > 0 ? instructions : ["Engage with the rite in mindful focus."],
    durationMinutes,
    difficulty,
    reflectionPrompt,
    reason,
    // Legacy field for backward compat with existing frontend rendering
    ritualText: `${title}: ${description}`,
  };
}

/**
 * Calculate aggregate participation level and guidance from recent logs.
 * Bounded to 7-day window.
 */
function calcActivitySignal(recentLogs = [], memberCount = 1) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recent7dLogs = (recentLogs || []).filter((l) => {
    const d = l && l.createdAt ? new Date(l.createdAt) : null;
    return d && d >= sevenDaysAgo;
  });
  const count = recent7dLogs.length;
  const countMembers = Math.max(1, memberCount || 1);

  let pace = "quiet";
  let guidance = "The culture has been quiet recently. Design an inviting, low-friction rite (5-10 minutes) that makes re-engagement effortless.";
  if (count >= 8 || count >= countMembers * 2) {
    pace = "highly active";
    guidance = "The culture has strong momentum and high active participation. The rite can be more ambitious, collaborative, or deeply ceremonial (15-30 minutes).";
  } else if (count > 0) {
    pace = "moderately active";
    guidance = "The culture maintains a steady daily rhythm. Offer a balanced rite (10-20 minutes) sustaining communal cadence.";
  }

  return {
    pace,
    recentCount: count,
    memberCount: countMembers,
    guidance,
  };
}

/**
 * Normalized string comparison helper for duplicate detection.
 * Lowercases, strips punctuation and common stop words.
 */
function normalizeText(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\b(the|a|an|of|in|to|for|with|on|at|by|and|or|from|as|is|are|it|our|your)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculates token similarity between two strings (Jaccard index on words > 2 chars).
 */
function tokenSimilarity(a, b) {
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  if (!normA || !normB) return 0;
  if (normA === normB) return 1.0;

  const tokensA = new Set(normA.split(" ").filter((t) => t.length > 2));
  const tokensB = new Set(normB.split(" ").filter((t) => t.length > 2));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) intersection++;
  }
  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Check if candidate ritual is too similar to any recent daily ritual or starter ritual.
 */
function checkRitualDuplicate(candidate, recentDailyRituals = [], starterRituals = []) {
  if (!candidate || !candidate.title) return { isDuplicate: false };

  const compList = [
    ...(recentDailyRituals || []).map((r) => ({
      title: r.title || r.ritualText || "",
      description: r.description || "",
      instructions: Array.isArray(r.instructions) ? r.instructions.join(" ") : "",
    })),
    ...(starterRituals || []).map((text) => ({
      title: typeof text === "string" ? text : "",
      description: "",
      instructions: "",
    })),
  ];

  for (const item of compList) {
    if (!item.title) continue;
    const titleSim = tokenSimilarity(candidate.title, item.title);
    const normCandTitle = normalizeText(candidate.title);
    const normItemTitle = normalizeText(item.title);

    // Exact match or high token overlap in title
    if (titleSim >= 0.7 || normCandTitle === normItemTitle) {
      return { isDuplicate: true, matchedTitle: item.title, similarity: titleSim };
    }

    // Near-identical title + instructions
    if (candidate.instructions?.length && item.instructions) {
      const candInstText = candidate.instructions.join(" ");
      const instSim = tokenSimilarity(candInstText, item.instructions);
      if (titleSim >= 0.5 && instSim >= 0.7) {
        return { isDuplicate: true, matchedTitle: item.title, similarity: Math.max(titleSim, instSim) };
      }
    }
  }

  return { isDuplicate: false };
}

/**
 * Build rich prompt for the AI ritual engine.
 * Synthesizes culture identity, values, traditions, aesthetic, jargon, recent rituals (last 7),
 * sanitized member reflections (last 20, no private data), and participation momentum.
 */
function buildRitualPrompt({ culture, recentDailyRituals = [], recentLogs = [], retryHint = "" }) {
  const memberCount = culture.members?.length || 1;
  const activity = calcActivitySignal(recentLogs, memberCount);

  // Traditions from starter rituals if defined
  const traditionsText = Array.isArray(culture.rituals) && culture.rituals.length > 0
    ? culture.rituals.slice(0, 8).map((r, i) => `${i + 1}. ${r}`).join("\n")
    : "None recorded yet.";

  // Last 7 daily rituals
  const recentRitualsText = recentDailyRituals && recentDailyRituals.length > 0
    ? recentDailyRituals
        .slice(0, 7)
        .map((r) => `[${r.date}] "${r.title || r.ritualText}" ${r.description ? `— ${r.description.slice(0, 150)}` : ""}`)
        .join("\n")
    : "No previous rituals yet — this is the inaugural rite.";

  // Last 20 member reflections (sanitized, strictly no private data like email/password/tokens)
  const recentLogsText = recentLogs && recentLogs.length > 0
    ? recentLogs
        .slice(0, 20)
        .map((l) => {
          const author = (l.userId && typeof l.userId === "object" ? l.userId.name : "") || "A member";
          const text = (typeof l.content === "string" ? l.content : "").slice(0, 200).replace(/[\r\n]+/g, " ");
          return `- ${author}: "${text}"`;
        })
        .join("\n")
    : "No member reflections recorded yet.";

  return `You generate ONE new daily ritual for this micro-culture.

CULTURE IDENTITY & CHARTER
Name: ${culture.name || "Micro-Culture"}
Essence: ${culture.description || ""}
Core Values: ${Array.isArray(culture.values) && culture.values.length ? culture.values.join(", ") : "none defined"}
Aesthetic Codes: ${[...(culture.aesthetic || []), ...(culture.vibeWords || [])].join(", ") || "unspecified"}
Jargon / Terminology: ${Array.isArray(culture.jargon) && culture.jargon.length ? culture.jargon.join("; ") : "none defined"}
Founding Traditions:
${traditionsText}

PARTICIPATION MOMENTUM
- Activity Level: ${activity.pace} (${activity.recentCount} completions in last 7 days among ${activity.memberCount} members)
- Guidance: ${activity.guidance}

RECENT RITUALS (Last 7 — do NOT duplicate or copy):
${recentRitualsText}

RECENT MEMBER REFLECTIONS (Last 20 — cultural memory signals):
${recentLogsText}

REQUIREMENTS:
1. SPECIFICITY & VOICE: Create a sacred, distinctive rite genuinely rooted in this culture's identity. Naturally weave 1-2 words from the culture's JARGON into the title, instructions, or reflection prompt.
2. NO GENERIC CLICHÉS: Strictly avoid generic mindfulness or corporate wellness platitudes (e.g. "Take a moment to reflect", "Drink water and breathe") unless explicitly fundamental to this culture.
3. RITUAL DIVERSITY: Vary the structure. Draw from suitable modalities (reflection, physical activity, observation, social interaction, creative activity, exploration, communication, or symbolic action). Do not repeat recent modalities if possible.
4. RITUAL CONTINUITY: Where fitting, subtly build upon previous rituals or member discoveries like a chapter sequel or evolving tradition, without copying the exercise.
5. MEMBER MEMORY: Respond to themes, discoveries, or difficulties expressed in recent member reflections.
6. SAFETY & PRACTICALITY: The rite must be realistic, completely safe, legal, achievable within ${activity.pace === "quiet" ? "5-10" : "10-30"} minutes in daily life, non-coercive, and non-financial.
7. REASON FIELD: Explain in 1-2 sentences the genuine cultural context behind this ritual (e.g., how it responds to member reflections, advances a value, or builds upon recent momentum). Never say "Good for reflection".
${retryHint ? `\nIMPORTANT RETRY INSTRUCTION: ${retryHint}\n` : ""}
Return ONLY valid JSON matching this shape:
{
  "title": "evocative ritual title (max 8 words)",
  "description": "1-3 sentences explaining the rite and its cultural meaning",
  "instructions": ["step 1 (clear actionable step)", "step 2", "step 3"],
  "durationMinutes": ${activity.pace === "quiet" ? 10 : 15},
  "difficulty": "easy",
  "reflectionPrompt": "a poignant reflection question for members after completing the ritual",
  "reason": "1-2 sentences explaining why this ritual was chosen given recent reflections, history, or cultural momentum"
}`;
}

/**
 * Build rich prompt for the AI culture blueprint generator.
 * Deeply grounds the generated charter in the user's original concept and enforces anti-cliché rules.
 */
function buildCultureBlueprintPrompt({ name, description, vibeWords = [], retryReason = "" }) {
  const vibeText = Array.isArray(vibeWords) && vibeWords.length > 0
    ? vibeWords.join(", ")
    : "none specified";

  return `You are a cultural architect designing a fictional "micro-culture" — a small, distinct community with its own sacred ethos, ceremonies, lexicon, and aesthetics.

FOUNDING CONCEPT (USER'S ORIGINAL VISION - HIGHEST PRIORITY):
Culture Name: ${name}
Core Premise & Ethos: ${description}
Vibe / Atmosphere Keywords: ${vibeText}

DESIGN REQUIREMENTS:
1. USER CONCEPT PRIORITY: Deeply honor the user's premise. Do NOT overwrite or dilute it into a generic archetype. All elements must tangibly derive from and reinforce this specific cultural world.
2. CORE VALUES (3–5 values):
   - Formulate 3 to 5 concrete, evocative values (short phrases or principles).
   - Each value must be distinct from the others and directly reflect this culture's specific worldview.
   - NEVER use generic isolated words like "Community", "Growth", "Creativity", "Respect", "Positivity", or "Inclusivity" unless given rich, culture-specific context.
3. SACRED JARGON & LEXICON (3–6 terms):
   - Invent 3 to 6 authentic terms that members use in daily interactions.
   - Format STRICTLY as "term: concise definition and cultural usage".
   - Terms must emerge organically from the culture's metaphors and practices (e.g. cartography, weaving, silence, forging, astronomy) — NOT arbitrary sci-fi/fantasy gibberish or corporate buzzwords.
4. FOUNDING RITUALS / TRADITIONS (3–5 rituals):
   - Create 3 to 5 distinct, tangible rites that members perform.
   - Each ritual must be actionable, safe, doable in a single day, and imbued with ceremony.
   - STRICTLY AVOID generic mindfulness/wellness clichés like "take a moment to reflect on your day", "share your feelings", "take a deep breath and center yourself", or "write in a journal" unless unique to this culture's premise.
5. AESTHETIC CODES (3–6 keywords):
   - 3 to 6 sensory, material, textural, or visual keywords (e.g. "matte obsidian", "raw indigo linen", "candlelit slate", "brass compass", "dusk mist").
   - AVOID bland, vague buzzwords like "minimal", "modern", "clean", "beautiful", "aesthetic".
6. SACRED SYMBOL (1 symbol):
   - A single emoji or glyph that serves as the visual totem of this culture.
7. INTERNAL COHERENCE & ANTI-CLICHÉ:
   - Values, jargon, rituals, and aesthetic must form ONE coherent, immersive cultural tapestry.
   - Avoid startup jargon (synergy, 10x, networking, scaling) and self-help clichés.
${retryReason ? `\nCRITICAL RETRY CORRECTION: The previous generation failed validation: ${retryReason}. Ensure all fields are unique, jargon has definitions with colons, rituals are specific and actionable, and values are distinct.\n` : ""}
Return ONLY valid JSON matching this exact shape:
{
  "aesthetic": ["3-5 sensory aesthetic keywords"],
  "values": ["3-5 concrete, distinct cultural values"],
  "jargon": ["3-6 terms formatted strictly as 'term: meaning'"],
  "rituals": ["3-5 actionable founding ritual descriptions"],
  "symbol": "a single emoji representing this culture"
}`;
}

/**
 * Generate a culture blueprint with automatic single retry on validation error.
 */
async function generateCultureBlueprint({ name, description, vibeWords = [], clientOverride = null }) {
  const aiClient = clientOverride || client;
  const MAX_ATTEMPTS = 2; // Strict limit: 1 normal attempt, at most 1 retry if validation fails
  let retryReason = "";
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const prompt = buildCultureBlueprintPrompt({
      name,
      description,
      vibeWords,
      retryReason,
    });

    let raw;
    try {
      const completion = await aiClient.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: attempt === 1 ? 0.85 : 0.95,
        response_format: { type: "json_object" },
      });

      raw = parseJSONResponse(completion.choices[0].message.content);
    } catch (err) {
      if (attempt < MAX_ATTEMPTS) {
        retryReason = "Please ensure the response is strictly valid JSON matching the requested schema.";
        continue;
      }
      throw err;
    }

    try {
      const validated = validateBlueprint(raw, { strict: attempt < MAX_ATTEMPTS });
      return validated;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_ATTEMPTS) {
        retryReason = err.message;
        continue;
      }
    }
  }

  // Graceful fallback if attempt 2 still had validation issues
  console.warn(`[AI Culture Blueprint] Strict validation failed after retry: ${lastError?.message}. Applying graceful normalization.`);
  return {
    aesthetic: ["distinct ethos", "crafted atmosphere", "ambient focus"],
    values: [`Commitment to ${name}`, "Intentional practice", "Shared cultural craft"],
    jargon: ["rite: the sacred communal practice", "charter: our foundational covenant", "sanctuary: our shared space"],
    rituals: [`The Inaugural Rite: gather in quiet focus to honor the ethos of ${name}`],
    symbol: "✨",
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

    const blueprint = await generateCultureBlueprint({
      name: name.trim(),
      description: description.trim(),
      vibeWords: vibeArr,
    });

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
// with bounded history, duplicate protection, diversity, and graceful retries.
// ---------------------------------------------------------------------------
async function generateDailyRitual(culture, today, { clientOverride = null } = {}) {
  const aiClient = clientOverride || client;

  // --- Culture Memory: last 7 daily rituals (avoid repetition) ---
  const recentDailyRituals = await DailyRitual.find({ cultureId: culture._id })
    .sort({ date: -1 })
    .limit(7)
    .lean();

  // --- Culture Memory: last 20 member ritual logs (participation signals) ---
  // Select only name from userId to prevent exposing private user information
  const recentLogs = await RitualLog.find({ cultureId: culture._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("userId", "name")
    .lean();

  const starterRituals = Array.isArray(culture.rituals) ? culture.rituals : [];

  let candidateRitual = null;
  let retryHint = "";
  const MAX_ATTEMPTS = 2; // Strict limit: 1 normal attempt, at most 1 retry if duplicate/invalid

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const prompt = buildRitualPrompt({
      culture,
      recentDailyRituals,
      recentLogs,
      retryHint,
    });

    let raw;
    try {
      const completion = await aiClient.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: attempt === 1 ? 0.85 : 0.95,
        response_format: { type: "json_object" },
      });

      raw = parseJSONResponse(completion.choices[0].message.content);
    } catch (err) {
      if (attempt < MAX_ATTEMPTS) {
        retryHint = "Please ensure the response is strictly valid JSON with no extraneous text.";
        continue;
      }
      throw err;
    }

    try {
      candidateRitual = validateStructuredRitual(raw);
    } catch (err) {
      if (attempt < MAX_ATTEMPTS) {
        retryHint = `Previous attempt had invalid structure: ${err.message}. Provide non-empty title, description, instructions array, reflectionPrompt, and reason.`;
        continue;
      }
      throw err;
    }

    // Check duplicate against recent daily rituals and starter rituals
    const dupCheck = checkRitualDuplicate(candidateRitual, recentDailyRituals, starterRituals);
    if (!dupCheck.isDuplicate) {
      break;
    }

    // Duplicate detected
    if (attempt < MAX_ATTEMPTS) {
      retryHint = `The title "${candidateRitual.title}" is too similar to an existing ritual "${dupCheck.matchedTitle}". Please create a completely distinct rite exploring a different theme or modality.`;
      continue;
    } else {
      // Graceful fallback on final attempt: avoid infinite loop or error
      candidateRitual.title = `${candidateRitual.title} (Variation)`;
      break;
    }
  }

  // Persist with upsert to safely handle rare race conditions
  const dailyRitual = await DailyRitual.findOneAndUpdate(
    { cultureId: culture._id, date: today },
    { $setOnInsert: { cultureId: culture._id, date: today, ...candidateRitual } },
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

export {
  parseJSONResponse,
  validateBlueprint,
  buildCultureBlueprintPrompt,
  generateCultureBlueprint,
  validateStructuredRitual,
  calcActivitySignal,
  normalizeText,
  tokenSimilarity,
  checkRitualDuplicate,
  buildRitualPrompt,
  generateDailyRitual,
};

export default router;
