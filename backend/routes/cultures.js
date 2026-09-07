import express from "express";
import Culture from "../models/Culture.js";
import Ritual from "../models/Ritual.js";
import RitualLog from "../models/RitualLog.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

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

    res.json({
      cultures,
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
    const rituals = await Ritual.find({ cultureId: culture._id, status: "active" });
    res.json({ ...culture.toJSON(), activeRituals: rituals });
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

export default router;
