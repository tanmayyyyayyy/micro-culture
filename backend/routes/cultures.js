import express from "express";
import Culture from "../models/Culture.js";
import Ritual from "../models/Ritual.js";
import RitualLog from "../models/RitualLog.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// Culture Progression Calculator
// ---------------------------------------------------------------------------
// Score = members * 4 + ritualLogs * 2 + ageDays * 0.2   (integer, min 0)
// Stages (deterministic — same inputs always produce same output):
//   SEED        0–9    level 1
//   AWAKENING  10–24   level 2
//   GROWING    25–49   level 3
//   ESTABLISHED 50–99  level 4
//   THRIVING   100+    level 5
// progress (0-100) = how far through the current stage the culture is.
// ---------------------------------------------------------------------------
const STAGES = [
  { stage: "SEED",        level: 1, min: 0,   max: 10  },
  { stage: "AWAKENING",   level: 2, min: 10,  max: 25  },
  { stage: "GROWING",     level: 3, min: 25,  max: 50  },
  { stage: "ESTABLISHED", level: 4, min: 50,  max: 100 },
  { stage: "THRIVING",    level: 5, min: 100, max: null },
];

function calcProgression(memberCount, logCount, createdAt) {
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  const score   = memberCount * 4 + logCount * 2 + ageDays * 0.2;

  let stageObj = STAGES[STAGES.length - 1];
  for (const s of STAGES) {
    if (s.max === null || score < s.max) { stageObj = s; break; }
  }

  let progress;
  if (stageObj.max === null) {
    progress = 100;
  } else {
    progress = Math.min(
      100,
      Math.round(((score - stageObj.min) / (stageObj.max - stageObj.min)) * 100)
    );
  }

  return {
    stage:    stageObj.stage,
    level:    stageObj.level,
    progress: Math.max(0, progress),
    score:    Math.round(score),
  };
}

// ---------------------------------------------------------------------------
// Streak Calculator
// ---------------------------------------------------------------------------
// Takes an array of Date objects (or ISO strings) — one per ritual log for a
// single user in a single culture. Returns { currentStreak, longestStreak,
// lastCompletedAt }.
//
// Algorithm:
//   1. Deduplicate by calendar day (UTC date string YYYY-MM-DD).
//   2. Sort ascending.
//   3. Walk backwards from today counting consecutive days.
//   4. Track the longest run seen anywhere in the history.
//
// "Today" is defined as UTC date of Date.now() so the server timezone is
// irrelevant — all clients and the server agree on UTC day boundaries.
// ---------------------------------------------------------------------------
function calcStreak(logDates) {
  if (!logDates || logDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCompletedAt: null };
  }

  const toDay = (d) => new Date(d).toISOString().slice(0, 10); // "YYYY-MM-DD"
  const todayStr  = toDay(Date.now());

  // Unique sorted set of day strings
  const daySet = [...new Set(logDates.map(toDay))].sort();
  const lastDay = daySet[daySet.length - 1];

  // --- Longest streak (full pass) ---
  let longest = 1, run = 1;
  for (let i = 1; i < daySet.length; i++) {
    const prev = new Date(daySet[i - 1]);
    const curr = new Date(daySet[i]);
    const diffDays = Math.round((curr - prev) / 86_400_000);
    if (diffDays === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  // --- Current streak (backwards from today or yesterday) ---
  // The streak is still valid if the last completion was yesterday (the user
  // hasn't had a chance to complete today yet).
  const diffFromToday = Math.round(
    (new Date(todayStr) - new Date(lastDay)) / 86_400_000
  );

  let current = 0;
  if (diffFromToday <= 1) {
    // Count backwards from the last completed day
    current = 1;
    for (let i = daySet.length - 2; i >= 0; i--) {
      const prev = new Date(daySet[i]);
      const next = new Date(daySet[i + 1]);
      if (Math.round((next - prev) / 86_400_000) === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak:  current,
    longestStreak:  Math.max(longest, current),
    lastCompletedAt: new Date(lastDay).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Recognition Calculator
// ---------------------------------------------------------------------------
// Derived from total ritual log count — never stored, always computed.
// Levels:
//   INITIATE      ≥ 1 ritual
//   PRACTITIONER  ≥ 7 rituals
//   RITUAL_KEEPER ≥ 30 rituals
// ---------------------------------------------------------------------------
function calcRecognition(totalLogs) {
  if (totalLogs >= 30) return { title: "Ritual Keeper",   key: "RITUAL_KEEPER",  totalLogs };
  if (totalLogs >=  7) return { title: "Practitioner",    key: "PRACTITIONER",   totalLogs };
  if (totalLogs >=  1) return { title: "Initiate",        key: "INITIATE",        totalLogs };
  return null; // no rituals completed yet
}

// ---------------------------------------------------------------------------
// Smart Culture Discovery Calculator
// ---------------------------------------------------------------------------
// Computes deterministic discovery metrics from real database activity:
//   - isNew: created within 14 days
//   - isActive: ritual completions in past 7 days (or within 30 days)
//   - isGrowing: multiple members + recent activity or growing progression
//   - isTrending: high recent ritual momentum relative to member base
//   - score: deterministic composite prioritizing recent participation over size
// ---------------------------------------------------------------------------
function calcDiscoveryMetrics(culture, logStats = {}) {
  const memberCount = culture.members?.length || 1;
  const totalLogs = logStats.totalLogs || 0;
  const recent7dLogs = logStats.recent7dLogs || 0;
  const recent30dLogs = logStats.recent30dLogs || 0;
  const lastActivityAt = logStats.lastActivityAt || null;

  const ageMs = Date.now() - new Date(culture.createdAt).getTime();
  const ageDays = Math.max(0, ageMs / 86_400_000);
  const isNew = ageDays <= 14;

  const progression = calcProgression(memberCount, totalLogs, culture.createdAt);

  // Deterministic Discovery Score (recent activity prioritized over raw size)
  // 5 pts per 7d log + 2 pts per 30d log + bounded member points (max 20) + small progression weight
  const activityScore = recent7dLogs * 5 + recent30dLogs * 2;
  const memberScore = Math.min(memberCount, 20) * 1.5;
  const progressionScore = (progression.score || 0) * 0.1;
  const recencyBoost = isNew && recent7dLogs > 0 ? 10 : (isNew ? 5 : 0);

  const discoveryScore = Math.round(activityScore + memberScore + progressionScore + recencyBoost);

  const isActive = Boolean(
    recent7dLogs > 0 ||
    (lastActivityAt && Date.now() - new Date(lastActivityAt).getTime() <= 30 * 86_400_000)
  );
  const isGrowing = Boolean(
    (memberCount >= 2 && (recent7dLogs > 0 || recent30dLogs > 0)) ||
    (memberCount >= 2 && progression.stage === "GROWING")
  );
  const isTrending = Boolean(recent7dLogs >= 2 || (recent7dLogs >= 1 && memberCount >= 2));

  // Primary badge selection (single priority badge to avoid clutter)
  let badge = null;
  if (isTrending) {
    badge = "TRENDING";
  } else if (isActive && recent7dLogs > 0) {
    badge = "ACTIVE";
  } else if (isNew) {
    badge = "NEW";
  }

  // Tasteful real-data activity snippet
  let recentActivityText = null;
  if (recent7dLogs > 0) {
    recentActivityText = `${recent7dLogs} ${recent7dLogs === 1 ? "rite" : "rites"} this week`;
  } else if (isNew) {
    recentActivityText = "Newly founded";
  } else if (totalLogs > 0) {
    recentActivityText = `${totalLogs} ${totalLogs === 1 ? "rite" : "rites"} total`;
  }

  return {
    badge,
    score: discoveryScore,
    recent7dLogs,
    recent30dLogs,
    totalLogs,
    lastActivityAt,
    isNew,
    isActive,
    isGrowing,
    isTrending,
    recentActivityText,
    progression,
  };
}

// ---------------------------------------------------------------------------
// POST /cultures — Create a culture (requires AI blueprint pre-generated)
// ---------------------------------------------------------------------------
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name, description, vibeWords, aesthetic, values, jargon, rituals, symbol, imageUrl, color, isPublished } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: "name and description are required" });
    }

    const culture = await Culture.create({
      name,
      description,
      vibeWords: vibeWords || [],
      aesthetic: aesthetic || [],
      values: values || [],
      jargon: jargon || [],
      rituals: rituals || [],
      symbol: symbol || "",
      imageUrl: imageUrl || "",
      color: color || "",
      creatorId: req.userId,
      members: [req.userId],
      isPublished: !!isPublished,
    });

    // Seed Ritual documents from the starter ritual strings, if any
    if (rituals?.length) {
      await Ritual.insertMany(
        rituals.map((text) => ({ cultureId: culture._id, text, isAIgenerated: true }))
      );
    }

    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { createdCultures: culture._id, joinedCultures: culture._id },
    });

    res.status(201).json(culture);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /cultures — Smart Culture Discovery & Search
// Accepts optional `q` (search) and `filter` (all, trending, new, active, growing).
// Aggregates real DB activity in 1 query across all matched cultures (Zero N+1).
// ---------------------------------------------------------------------------
router.get("/", async (req, res, next) => {
  try {
    const { q, filter } = req.query;
    const queryFilter = { isPublished: true };

    if (q && typeof q === "string" && q.trim()) {
      const regex = { $regex: q.trim(), $options: "i" };
      queryFilter.$or = [
        { name: regex },
        { description: regex },
        { vibeWords: regex },
        { aesthetic: regex },
        { values: regex },
        { jargon: regex },
      ];
    }

    const cultures = await Culture.find(queryFilter).lean();
    if (!cultures.length) {
      return res.json([]);
    }

    const cultureIds = cultures.map((c) => c._id);

    // Single aggregation query across all cultures for real participation stats
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const logStatsAgg = await RitualLog.aggregate([
      { $match: { cultureId: { $in: cultureIds } } },
      {
        $group: {
          _id: "$cultureId",
          totalLogs: { $sum: 1 },
          recent7dLogs: {
            $sum: { $cond: [{ $gte: ["$createdAt", sevenDaysAgo] }, 1, 0] },
          },
          recent30dLogs: {
            $sum: { $cond: [{ $gte: ["$createdAt", thirtyDaysAgo] }, 1, 0] },
          },
          lastActivityAt: { $max: "$createdAt" },
        },
      },
    ]);

    const logStatsMap = {};
    for (const stat of logStatsAgg) {
      logStatsMap[stat._id.toString()] = stat;
    }

    // Attach discovery metrics & progression
    let enriched = cultures.map((c) => {
      const stats = logStatsMap[c._id.toString()] || {};
      const discovery = calcDiscoveryMetrics(c, stats);
      return {
        ...c,
        progression: discovery.progression,
        discovery,
      };
    });

    // Apply category filter
    const selectedFilter = (filter || "all").toLowerCase().trim();
    const STUDENT_CATEGORIES = ["study", "code", "design", "ai", "security", "build", "career"];

    if (STUDENT_CATEGORIES.includes(selectedFilter)) {
      const boundaryRegex = new RegExp(`\\b${selectedFilter}\\b`, "i");
      enriched = enriched.filter((c) => {
        const words = (c.vibeWords || []).map((w) => w.toLowerCase());
        const combinedText = `${c.name || ""} ${c.description || ""} ${words.join(" ")}`;
        return (
          words.includes(selectedFilter) ||
          boundaryRegex.test(combinedText) ||
          (selectedFilter === "ai" && /\b(ai|ml|llm|genai|neural|machine learning)\b/i.test(combinedText))
        );
      });
    } else if (selectedFilter === "trending") {
      enriched = enriched
        .filter((c) => c.discovery.isTrending || c.discovery.recent7dLogs > 0)
        .sort((a, b) => b.discovery.score - a.discovery.score);
    } else if (selectedFilter === "new") {
      const newOnly = enriched.filter((c) => c.discovery.isNew);
      if (newOnly.length > 0) {
        enriched = newOnly.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        // Graceful fallback if older dataset: return newest cultures in DB
        enriched = enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } else if (selectedFilter === "active") {
      enriched = enriched
        .filter((c) => c.discovery.isActive)
        .sort((a, b) => {
          if (b.discovery.recent7dLogs !== a.discovery.recent7dLogs) {
            return b.discovery.recent7dLogs - a.discovery.recent7dLogs;
          }
          return (b.discovery.score || 0) - (a.discovery.score || 0);
        });
    } else if (selectedFilter === "growing") {
      enriched = enriched
        .filter((c) => c.discovery.isGrowing)
        .sort((a, b) => (b.discovery.score || 0) - (a.discovery.score || 0));
    } else {
      // "all" - deterministic sort by discovery score then recency
      enriched.sort((a, b) => {
        if (b.discovery.score !== a.discovery.score) {
          return b.discovery.score - a.discovery.score;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /dashboard — Returns all cultures the authenticated user has joined,
// in a single query. Fixes the N+1 problem in Dashboard.jsx.
//
// Response: { cultures: [...], stats: { total, created } }
// ---------------------------------------------------------------------------
router.get("/dashboard", requireAuth, async (req, res, next) => {
  try {
    // Get fresh user data from DB (source of truth)
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const joinedIds = user.joinedCultures || [];
    const createdIds = user.createdCultures || [];

    // Single query for all joined cultures
    const cultures = await Culture.find({ _id: { $in: joinedIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Attach progression + personal streak to each culture
    // One aggregate query fetches all user's logs across their joined cultures.
    const cultureIds = cultures.map((c) => c._id);

    const [logCountAgg, userLogsAgg] = await Promise.all([
      // Culture-wide log counts (for progression)
      RitualLog.aggregate([
        { $match: { cultureId: { $in: cultureIds } } },
        { $group: { _id: "$cultureId", count: { $sum: 1 } } },
      ]),
      // User's personal logs (for streak + recognition) — dates only
      RitualLog.aggregate([
        { $match: { cultureId: { $in: cultureIds }, userId: user._id } },
        { $project: { cultureId: 1, createdAt: 1, _id: 0 } },
      ]),
    ]);

    const logCountMap = {};
    for (const lc of logCountAgg) logCountMap[lc._id.toString()] = lc.count;

    // Group user logs by culture
    const userLogsByCulture = {};
    for (const l of userLogsAgg) {
      const key = l.cultureId.toString();
      if (!userLogsByCulture[key]) userLogsByCulture[key] = [];
      userLogsByCulture[key].push(l.createdAt);
    }

    const culturesWithProgression = cultures.map((c) => {
      const cid = c._id.toString();
      const totalLogs = logCountMap[cid] || 0;
      const userDates = userLogsByCulture[cid] || [];
      return {
        ...c,
        progression:  calcProgression((c.members || []).length, totalLogs, c.createdAt),
        participation: {
          ...calcStreak(userDates),
          recognition:  calcRecognition(userDates.length),
          totalPersonalRituals: userDates.length,
        },
      };
    });

    // Fetch recent discussions across joined cultures
    const recentDiscussions = await RitualLog.find({ cultureId: { $in: cultureIds } })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("userId", "name")
      .populate("cultureId", "name symbol color")
      .lean();

    res.json({
      cultures: culturesWithProgression,
      recentDiscussions,
      stats: {
        totalJoined: joinedIds.length,
        totalCreated: createdIds.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /cultures/:id — Get culture detail + active rituals
// Accepts optional auth — if the requester is a member, personal participation
// data (streak + recognition) is returned. Non-members get no private data.
// ---------------------------------------------------------------------------
router.get("/:id", async (req, res, next) => {
  try {
    const culture = await Culture.findById(req.params.id);
    if (!culture) return res.status(404).json({ error: "Culture not found" });

    // Optionally resolve authenticated user (do not fail if unauthenticated)
    let userId = null;
    try {
      const authHeader = req.headers.authorization || "";
      if (authHeader.startsWith("Bearer ")) {
        const jwt = await import("jsonwebtoken");
        const secret = process.env.JWT_SECRET || "change_me_in_env";
        const decoded = jwt.default.verify(authHeader.slice(7), secret);
        userId = decoded.userId || decoded.id || null;
      }
    } catch (_) { /* unauthenticated — skip personal data */ }

    const isMember = userId &&
      culture.members.some((m) => m.toString() === userId.toString());

    const [rituals, logCount] = await Promise.all([
      Ritual.find({ cultureId: culture._id, status: "active" }),
      RitualLog.countDocuments({ cultureId: culture._id }),
    ]);

    const progression = calcProgression(
      (culture.members || []).length,
      logCount,
      culture.createdAt
    );

    // Personal participation (members only — private)
    let participation = null;
    if (isMember) {
      const userLogs = await RitualLog.find(
        { cultureId: culture._id, userId },
        { createdAt: 1 }
      ).lean();
      const dates = userLogs.map((l) => l.createdAt);
      participation = {
        ...calcStreak(dates),
        recognition: calcRecognition(userLogs.length),
        totalPersonalRituals: userLogs.length,
      };
    }

    res.json({
      ...culture.toJSON(),
      activeRituals: rituals,
      progression: { ...progression, completedRituals: logCount, members: (culture.members || []).length },
      ...(participation !== null ? { participation } : {}),
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /cultures/:id/join
// ---------------------------------------------------------------------------
router.post("/:id/join", requireAuth, async (req, res, next) => {
  try {
    const culture = await Culture.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.userId } },
      { new: true }
    );
    if (!culture) return res.status(404).json({ error: "Culture not found" });
    await User.findByIdAndUpdate(req.userId, { $addToSet: { joinedCultures: culture._id } });
    res.json(culture);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /cultures/:id/leave
// ---------------------------------------------------------------------------
router.post("/:id/leave", requireAuth, async (req, res, next) => {
  try {
    const culture = await Culture.findById(req.params.id);
    if (!culture) return res.status(404).json({ error: "Culture not found" });

    // Creator cannot leave their own culture
    if (culture.creatorId.toString() === req.userId.toString()) {
      return res.status(400).json({ error: "Culture creator cannot leave. Delete or transfer the culture instead." });
    }

    await Culture.findByIdAndUpdate(req.params.id, { $pull: { members: req.userId } });
    await User.findByIdAndUpdate(req.userId, { $pull: { joinedCultures: culture._id } });
    res.json({ message: "Left culture successfully" });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /cultures/:id — Update culture charter (founder only)
// ---------------------------------------------------------------------------
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const culture = await Culture.findById(req.params.id);
    if (!culture) return res.status(404).json({ error: "Culture not found" });

    if (culture.creatorId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Only the culture founder can edit this culture charter." });
    }

    const { description, vibeWords, symbol, color, values, aesthetic, jargon } = req.body;
    if (description !== undefined) culture.description = description;
    if (vibeWords !== undefined) culture.vibeWords = Array.isArray(vibeWords) ? vibeWords : [];
    if (symbol !== undefined) culture.symbol = symbol;
    if (color !== undefined) culture.color = color;
    if (values !== undefined) culture.values = Array.isArray(values) ? values : [];
    if (aesthetic !== undefined) culture.aesthetic = Array.isArray(aesthetic) ? aesthetic : [];
    if (jargon !== undefined) culture.jargon = Array.isArray(jargon) ? jargon : [];

    await culture.save();
    res.json(culture);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /cultures/:id — Delete culture (founder only)
// ---------------------------------------------------------------------------
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const culture = await Culture.findById(req.params.id);
    if (!culture) return res.status(404).json({ error: "Culture not found" });

    if (culture.creatorId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Only the culture founder can delete this culture." });
    }

    // Clean up culture and user references
    await Culture.findByIdAndDelete(req.params.id);
    await User.updateMany(
      { $or: [{ joinedCultures: req.params.id }, { createdCultures: req.params.id }] },
      { $pull: { joinedCultures: req.params.id, createdCultures: req.params.id } }
    );
    await Ritual.deleteMany({ cultureId: req.params.id });
    await RitualLog.deleteMany({ cultureId: req.params.id });

    res.json({ message: "Culture deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export { STAGES, calcProgression, calcStreak, calcRecognition, calcDiscoveryMetrics };

export default router;
