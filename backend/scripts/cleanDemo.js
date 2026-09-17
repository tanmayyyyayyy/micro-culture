import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Culture from "../models/Culture.js";
import DailyRitual from "../models/DailyRitual.js";
import RitualLog from "../models/RitualLog.js";

export const OLD_SHOWCASE_NAMES = [
  "Nocturne Lens",
  "Sub Rosa Codex",
  "Concrete Frequency",
  "Circuit & Solder",
  "Cricket Club",
  "Lo-fi Corner",
  "DSA & Coding",
  "Gaming Lounge",
  "Book Club",
  "Movie Nights",
  "Photography Walks",
  "Fitness Together",
  "Music Discovery",
  "Travel Stories",
  "Aetheria Collective",
  "P0 Test Culture",
];

export async function runDemoClean() {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ Demo clean is disabled in production.");
    throw new Error("Demo clean is disabled in production.");
  }

  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/microculture";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  console.log("🧹 Cleaning demo seed data...");

  // Find demo users (only @microculture.local users)
  const demoUsers = await User.find({ email: { $regex: /@microculture\.local$/i } });
  const demoUserIds = demoUsers.map((u) => u._id);

  // Find demo cultures created by demo users OR matching old showcase names
  const demoCultures = await Culture.find({
    $or: [
      { creatorId: { $in: demoUserIds } },
      { name: { $in: OLD_SHOWCASE_NAMES } },
    ],
  });
  const demoCultureIds = demoCultures.map((c) => c._id);

  // Delete demo ritual logs, daily rituals, cultures, and users
  const deletedLogs = await RitualLog.deleteMany({
    $or: [{ userId: { $in: demoUserIds } }, { cultureId: { $in: demoCultureIds } }],
  });
  const deletedRituals = await DailyRitual.deleteMany({ cultureId: { $in: demoCultureIds } });
  const deletedCultures = await Culture.deleteMany({ _id: { $in: demoCultureIds } });
  const deletedUsers = await User.deleteMany({ _id: { $in: demoUserIds } });

  console.log(
    `✅ Demo clean finished: ${deletedUsers.deletedCount} users, ${deletedCultures.deletedCount} cultures, ${deletedRituals.deletedCount} rituals, ${deletedLogs.deletedCount} logs removed.`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runDemoClean()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Demo clean failed:", err.message);
      process.exit(1);
    });
}
