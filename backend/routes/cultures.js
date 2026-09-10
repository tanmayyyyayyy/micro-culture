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
// GET /cultures — List / search published cultures
// ---------------------------------------------------------------------------
router.get("/", async (req, res, next) => {
  try {
    const { q } = req.query;
    const filter = { isPublished: true };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { vibeWords: { $regex: q, $options: "i" } },
      ];
    }
    const cultures = await Culture.find(filter).sort({ createdAt: -1 }).lean();
    res.json(cultures);
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

    // Attach progression to each culture (one aggregation query for all)
    const cultureIds = cultures.map((c) => c._id);
    const logCounts = await RitualLog.aggregate([
      { $match: { cultureId: { $in: cultureIds } } },
      { $group: { _id: "$cultureId", count: { $sum: 1 } } },
    ]);
    const logCountMap = {};
    for (const lc of logCounts) logCountMap[lc._id.toString()] = lc.count;

    const culturesWithProgression = cultures.map((c) => ({
      ...c,
      progression: calcProgression(
        (c.members || []).length,
        logCountMap[c._id.toString()] || 0,
        c.createdAt
      ),
    }));

    res.json({
      cultures: culturesWithProgression,
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
// ---------------------------------------------------------------------------
router.get("/:id", async (req, res, next) => {
  try {
    const culture = await Culture.findById(req.params.id);
    if (!culture) return res.status(404).json({ error: "Culture not found" });

    const [rituals, logCount] = await Promise.all([
      Ritual.find({ cultureId: culture._id, status: "active" }),
      RitualLog.countDocuments({ cultureId: culture._id }),
    ]);

    const progression = calcProgression(
      (culture.members || []).length,
      logCount,
      culture.createdAt
    );

    res.json({
      ...culture.toJSON(),
      activeRituals: rituals,
      progression: { ...progression, completedRituals: logCount, members: (culture.members || []).length },
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

export default router;
