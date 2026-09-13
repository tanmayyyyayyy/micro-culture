/**
 * P3.3 — Demo Data Seeding & Showcase Readiness Test Suite
 *
 * Focused tests for demo seed:
 * 1. Production safety (throws error when NODE_ENV === 'production')
 * 2. Idempotency (running seed twice produces identical record counts)
 * 3. Schema validity and relationship integrity
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
    const culturesCount = await Culture.countDocuments({ name: { $in: ["Nocturne Lens", "Sub Rosa Codex", "Concrete Frequency", "Circuit & Solder"] } });
    
    assert.strictEqual(usersCount, 4, "Must seed exactly 4 demo users");
    assert.strictEqual(culturesCount, 4, "Must seed exactly 4 demo cultures");
  });

  // Test 3: Idempotency (run second time)
  await asyncIt("3. Running seed script multiple times is strictly idempotent (no duplicates)", async () => {
    delete process.env.NODE_ENV;
    await runDemoSeed();

    const usersCount = await User.countDocuments({ email: { $regex: /@microculture\.local$/i } });
    const culturesCount = await Culture.countDocuments({ name: { $in: ["Nocturne Lens", "Sub Rosa Codex", "Concrete Frequency", "Circuit & Solder"] } });

    assert.strictEqual(usersCount, 4, "User count must remain 4 after re-seeding");
    assert.strictEqual(culturesCount, 4, "Culture count must remain 4 after re-seeding");
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
