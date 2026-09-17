/**
 * P3.3 / P5.1 — Demo Data Seeding & Showcase Readiness Test Suite
 *
 * Focused tests for demo seed:
 * 1. Production safety (throws error when NODE_ENV === 'production')
 * 2. Idempotency (running seed twice produces identical record counts)
 * 3. Schema validity and relationship integrity
 *
 * P5.1 update: 10 demo users (4 original + 6 new), 14 communities (4 original + 10 accessible).
 */
import assert from "assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

import { runDemoSeed } from "../scripts/seedDemo.js";
import User from "../models/User.js";
import Culture from "../models/Culture.js";
import DailyRitual from "../models/DailyRitual.js";
import RitualLog from "../models/RitualLog.js";

let passed = 0;
let failed = 0;

async function asyncIt(name, fn) {
  try {
    await fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name} ->`, err.message);
    failed++;
  }
}

async function runTests() {
  console.log("\n=== P3.3 Demo Data Seeding Test Suite ===\n");

  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/microculture";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  // Ensure NODE_ENV is development for test execution
  delete process.env.NODE_ENV;

  // Test 1: Production safety check
  await asyncIt("1. Refuses execution when NODE_ENV === 'production'", async () => {
    process.env.NODE_ENV = "production";
    let threw = false;
    try {
      await runDemoSeed();
    } catch (err) {
      threw = true;
      assert.strictEqual(err.message, "Demo seed is disabled in production.");
    } finally {
      delete process.env.NODE_ENV;
    }
    assert.strictEqual(threw, true, "Must throw an error in production environment");
  });

  // Test 2: First run of demo seed
  await asyncIt("2. Successfully seeds demo cultures, users, rituals, and logs", async () => {
    delete process.env.NODE_ENV;
    await runDemoSeed();

    const usersCount = await User.countDocuments({ email: { $regex: /@microculture\.local$/i } });
    const ALL_DEMO_CULTURE_NAMES = [
      "Nocturne Lens", "Sub Rosa Codex", "Concrete Frequency", "Circuit & Solder",
      "Cricket Club", "Lo-fi Corner", "DSA & Coding", "Gaming Lounge",
      "Book Club", "Movie Nights", "Photography Walks", "Fitness Together",
      "Music Discovery", "Travel Stories",
    ];
    const culturesCount = await Culture.countDocuments({ name: { $in: ALL_DEMO_CULTURE_NAMES } });

    assert.strictEqual(usersCount, 10, "Must seed exactly 10 demo users");
    assert.strictEqual(culturesCount, 14, "Must seed exactly 14 demo cultures");
  });

  // Test 3: Idempotency (run second time)
  await asyncIt("3. Running seed script multiple times is strictly idempotent (no duplicates)", async () => {
    delete process.env.NODE_ENV;
    await runDemoSeed();

    const usersCount = await User.countDocuments({ email: { $regex: /@microculture\.local$/i } });
    const ALL_DEMO_CULTURE_NAMES = [
      "Nocturne Lens", "Sub Rosa Codex", "Concrete Frequency", "Circuit & Solder",
      "Cricket Club", "Lo-fi Corner", "DSA & Coding", "Gaming Lounge",
      "Book Club", "Movie Nights", "Photography Walks", "Fitness Together",
      "Music Discovery", "Travel Stories",
    ];
    const culturesCount = await Culture.countDocuments({ name: { $in: ALL_DEMO_CULTURE_NAMES } });

    assert.strictEqual(usersCount, 10, "User count must remain 10 after re-seeding");
    assert.strictEqual(culturesCount, 14, "Culture count must remain 14 after re-seeding");
  });

  // Test 4: Relationship & Schema Integrity
  await asyncIt("4. Seeded data satisfies model schemas and relationship links", async () => {
    const culture = await Culture.findOne({ name: "Nocturne Lens" }).populate("creatorId members");
    assert.notStrictEqual(culture, null);
    assert.strictEqual(culture.symbol, "🌙");
    assert.strictEqual(culture.members.length, 4);
    assert.notStrictEqual(culture.creatorId, null);

    const rituals = await DailyRitual.find({ cultureId: culture._id });
    assert.strictEqual(rituals.length > 0, true, "Must have daily rituals for Nocturne Lens");

    const logs = await RitualLog.find({ cultureId: culture._id });
    assert.strictEqual(logs.length > 0, true, "Must have ritual logs for Nocturne Lens");

    // P5.1: Verify accessible communities seeded correctly
    const cricket = await Culture.findOne({ name: "Cricket Club" });
    assert.notStrictEqual(cricket, null, "Cricket Club must exist");
    assert.strictEqual(cricket.symbol, "🏏");
    assert.strictEqual(cricket.members.length >= 10, true, "Cricket Club should have 10+ members");

    const dsaCoding = await Culture.findOne({ name: "DSA & Coding" });
    assert.notStrictEqual(dsaCoding, null, "DSA & Coding must exist");
    assert.strictEqual(dsaCoding.symbol, "💻");

    // Aetheria Collective must be removed
    const aetheria = await Culture.findOne({ name: "Aetheria Collective" });
    assert.strictEqual(aetheria, null, "Aetheria Collective (QA artifact) must have been removed");
  });

  console.log("\n==========================================");
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("==========================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
