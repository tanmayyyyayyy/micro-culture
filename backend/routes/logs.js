import express from "express";
import mongoose from "mongoose";
import RitualLog from "../models/RitualLog.js";
import Culture from "../models/Culture.js";
import DailyRitual from "../models/DailyRitual.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /logs — Post a ritual log.
 *
 * Required: cultureId, content
 * Recommended: ritualId (the DailyRitual._id for today's ritual)
 *
 * Security:
 *   - User must be authenticated
 *   - User must be a member of the culture
 *   - If ritualId is provided, it must belong to the given culture
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { cultureId, ritualId, content, imageUrl } = req.body;

    if (!cultureId || !content) {
      return res.status(400).json({ error: "cultureId and content are required" });
    }
    if (typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "content must be a non-empty string" });
    }
    if (content.length > 2000) {
      return res.status(400).json({ error: "content must be under 2000 characters" });
    }

    // Verify culture exists and user is a member
    const culture = await Culture.findById(cultureId);
    if (!culture) return res.status(404).json({ error: "Culture not found" });

    const isMember = culture.members.some((m) => m.toString() === req.userId.toString());
    if (!isMember) {
      return res.status(403).json({ error: "You must be a member of this culture to post a log" });
    }

    // Validate ritualId if provided — must belong to this culture
    let validatedRitualId = null;
    if (ritualId) {
      if (!mongoose.Types.ObjectId.isValid(ritualId)) {
        return res.status(400).json({ error: "Invalid ritualId format" });
      }
      const ritual = await DailyRitual.findOne({ _id: ritualId, cultureId });
      if (!ritual) {
        return res.status(400).json({ error: "ritualId does not belong to this culture" });
      }
      validatedRitualId = ritual._id;
    }

    const log = await RitualLog.create({
      userId: req.userId,
      cultureId,
      ritualId: validatedRitualId,
      content: content.trim(),
      imageUrl: imageUrl || "",
    });

    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /logs/:cultureId — Get all logs for a culture.
 * Public read (by design — anyone can see culture activity).
 */
router.get("/:cultureId", async (req, res, next) => {
  try {
    const logs = await RitualLog.find({ cultureId: req.params.cultureId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("userId", "name")
      .populate("ritualId", "title date")
      .lean();
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

export default router;
