import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import RitualLog from "../models/RitualLog.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/register", authLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "password must be at least 8 characters" });
    }
    if (name.length > 100 || email.length > 200) {
      return res.status(400).json({ error: "name or email too long" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user._id);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user._id);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /auth/me — Return fresh user data from DB.
 * Used by the frontend to re-hydrate stale localStorage state after
 * join/leave/create operations. The DB is the source of truth.
 */
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
      .populate("joinedCultures", "name symbol color description members")
      .populate("createdCultures", "name symbol color description members");
    if (!user) return res.status(404).json({ error: "User not found" });

    const safeUser = user.toSafeJSON();
    const logsCount = await RitualLog.countDocuments({ userId: req.userId });
    safeUser.logsCount = logsCount;

    res.json({ user: safeUser });
  } catch (err) {
    next(err);
  }
});

export default router;
