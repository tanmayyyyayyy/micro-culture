/**
 * Focused test suite for the Upgraded AI Ritual Engine
 * Tests 1-14 as specified in the TASK requirements:
 * 1. Culture context reaches the AI
 * 2. Values are included
 * 3. Traditions are included where available
 * 4. Jargon is included where available
 * 5. Recent rituals are included
 * 6. Recent RitualLogs are included
 * 7. Private user data is not included
 * 8. Participation context is bounded
 * 9. Structured AI output is validated
 * 10. Duplicate ritual triggers at most one retry
 * 11. Retry cannot loop indefinitely (capped at 2 attempts, handles gracefully)
 * 12. Existing ritual persistence works
 * 13. Existing ritualId behavior works
 * 14. Existing memory loop works
 */
import assert from "assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

import {
  buildRitualPrompt,
  calcActivitySignal,
  normalizeText,
  tokenSimilarity,
  checkRitualDuplicate,
  validateStructuredRitual,
  parseJSONResponse,
  generateDailyRitual,
} from "../routes/ai.js";
import DailyRitual from "../models/DailyRitual.js";
import RitualLog from "../models/RitualLog.js";
import Culture from "../models/Culture.js";

let passed = 0;
let failed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name} ->`, err.message);
    failed++;
  }
}

async function itAsync(name, fn) {
  try {
    await fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name} ->`, err.message);
    failed++;
  }
}

console.log("=== Upgraded AI Ritual Engine Test Suite ===\n");

// Mock culture with full charter
const sampleCulture = {
  _id: new mongoose.Types.ObjectId(),
  name: "The Loom Keepers",
  description: "A collective dedicated to deliberate thought and digital craftsmanship.",
  values: ["Patience", "Craft", "Clarity"],
  rituals: ["Dawn Weaver Meditation", "Thread Unraveling at Twilight"],
  aesthetic: ["raw linen", "indigo ink", "slate"],
  vibeWords: ["deliberate", "tactile"],
  jargon: ["warp: foundational principle", "shuttle: focused work block", "unspool: release tension"],
  members: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
};

const sampleRecentRituals = [
  {
    date: "2026-09-11",
    title: "The Thread Inventory",
    description: "Inspect three commitments and discard one.",
    instructions: ["Review your list", "Select the non-essential", "Cut the thread"],
  },
  {
    date: "2026-09-10",
    title: "Silent Warp Alignment",
    description: "Align your workspace in absolute silence for 10 minutes.",
    instructions: ["Clear desk", "Breathe slowly"],
  },
];

const sampleRecentLogs = [
  {
    userId: {
      name: "Marcus",
      email: "marcus@secret.internal",
      password: "bcrypt_hash_secret_12345",
      token: "jwt.bearer.session.token",
    },
    content: "Found immense clarity when unspooling my backlog yesterday.",
    createdAt: new Date(),
  },
  {
    userId: {
      name: "Elena",
      email: "elena@private.org",
      password: "super_secret_password",
    },
    content: "The silence was challenging at first, but grounding.",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

// 1. Culture context reaches the AI
it("1. Culture context reaches the AI (name & description)", () => {
  const prompt = buildRitualPrompt({ culture: sampleCulture, recentDailyRituals: [], recentLogs: [] });
  assert.ok(prompt.includes("The Loom Keepers"), "Culture name must be in prompt");
  assert.ok(prompt.includes("deliberate thought and digital craftsmanship"), "Culture description must be in prompt");
});

// 2. Values are included
it("2. Values are included in the prompt", () => {
  const prompt = buildRitualPrompt({ culture: sampleCulture, recentDailyRituals: [], recentLogs: [] });
  assert.ok(prompt.includes("Patience"), "Values must include Patience");
  assert.ok(prompt.includes("Craft"), "Values must include Craft");
  assert.ok(prompt.includes("Clarity"), "Values must include Clarity");
});

// 3. Traditions are included where available
it("3. Traditions are included where available", () => {
  const prompt = buildRitualPrompt({ culture: sampleCulture, recentDailyRituals: [], recentLogs: [] });
  assert.ok(prompt.includes("Dawn Weaver Meditation"), "Tradition 1 must be present");
  assert.ok(prompt.includes("Thread Unraveling at Twilight"), "Tradition 2 must be present");
});

// 4. Jargon is included where available
it("4. Jargon is included where available", () => {
  const prompt = buildRitualPrompt({ culture: sampleCulture, recentDailyRituals: [], recentLogs: [] });
  assert.ok(prompt.includes("warp: foundational principle"), "Jargon term 1 must be present");
  assert.ok(prompt.includes("shuttle: focused work block"), "Jargon term 2 must be present");
});

// 5. Recent rituals are included
it("5. Recent rituals are included in prompt", () => {
  const prompt = buildRitualPrompt({ culture: sampleCulture, recentDailyRituals: sampleRecentRituals, recentLogs: [] });
  assert.ok(prompt.includes("The Thread Inventory"), "Recent ritual title must be in prompt");
  assert.ok(prompt.includes("2026-09-11"), "Recent ritual date must be in prompt");
  assert.ok(prompt.includes("Silent Warp Alignment"), "Second recent ritual must be in prompt");
});

// 6. Recent RitualLogs are included
it("6. Recent RitualLogs are included as memory signals", () => {
  const prompt = buildRitualPrompt({ culture: sampleCulture, recentDailyRituals: [], recentLogs: sampleRecentLogs });
  assert.ok(prompt.includes("Marcus"), "Member name Marcus must be in prompt");
  assert.ok(prompt.includes("Found immense clarity when unspooling"), "Member reflection snippet must be in prompt");
  assert.ok(prompt.includes("Elena"), "Member name Elena must be in prompt");
});

// 7. Private user data is not included
it("7. Private user data is strictly excluded from prompt", () => {
  const prompt = buildRitualPrompt({ culture: sampleCulture, recentDailyRituals: [], recentLogs: sampleRecentLogs });
  assert.ok(!prompt.includes("marcus@secret.internal"), "Email must not be exposed");
  assert.ok(!prompt.includes("bcrypt_hash_secret_12345"), "Password hash must not be exposed");
  assert.ok(!prompt.includes("jwt.bearer.session.token"), "Auth token must not be exposed");
  assert.ok(!prompt.includes("super_secret_password"), "Password must not be exposed");
  assert.ok(!prompt.includes("elena@private.org"), "Email must not be exposed");
});

// 8. Participation context is bounded
it("8. Participation context is bounded & accurately calculated", () => {
  // Quiet state
  const quiet = calcActivitySignal([], 3);
  assert.strictEqual(quiet.pace, "quiet");
  assert.strictEqual(quiet.recentCount, 0);

  // Moderate state
  const mod = calcActivitySignal([{ createdAt: new Date() }], 3);
  assert.strictEqual(mod.pace, "moderately active");

  // Highly active state
  const active = calcActivitySignal(
    Array(10).fill({ createdAt: new Date() }),
    2
  );
  assert.strictEqual(active.pace, "highly active");

  // Bounded check: prompt limits recent rituals to 7 and logs to 20
  const manyRituals = Array(25).fill(0).map((_, i) => ({
    date: `2026-09-${String(i + 1).padStart(2, "0")}`,
    title: `Ritual ${i + 1}`,
  }));
  const manyLogs = Array(50).fill(0).map((_, i) => ({
    userId: { name: `User ${i + 1}` },
    content: `Reflection ${i + 1}`,
    createdAt: new Date(),
  }));

  const boundedPrompt = buildRitualPrompt({ culture: sampleCulture, recentDailyRituals: manyRituals, recentLogs: manyLogs });
  assert.ok(boundedPrompt.includes("Ritual 1"), "First ritual in range included");
  assert.ok(boundedPrompt.includes("Ritual 7"), "7th ritual in range included");
  assert.ok(!boundedPrompt.includes("Ritual 8"), "8th ritual excluded (bounded to 7)");
  assert.ok(boundedPrompt.includes("User 20"), "20th log included");
  assert.ok(!boundedPrompt.includes("User 21"), "21st log excluded (bounded to 20)");
});

// 9. Structured AI output is validated
it("9. Structured AI output is validated correctly", () => {
  const valid = validateStructuredRitual({
    title: "The Shuttle Passage",
    description: "Weave twenty minutes of undivided attention into one task.",
    instructions: ["Silence notifications", "Set twenty minute timer", "Focus on single thread"],
    durationMinutes: 20,
    difficulty: "medium",
    reflectionPrompt: "What thread held your attention most securely?",
    reason: "Members noted difficulty focusing amid competing priorities; this rite restores single-threaded rhythm.",
  });

  assert.strictEqual(valid.title, "The Shuttle Passage");
  assert.strictEqual(valid.instructions.length, 3);
  assert.strictEqual(valid.durationMinutes, 20);
  assert.strictEqual(valid.difficulty, "medium");
  assert.ok(valid.reason.includes("competing priorities"));
  assert.strictEqual(valid.ritualText, "The Shuttle Passage: Weave twenty minutes of undivided attention into one task.");

  // Validation failure cases
  assert.throws(() => validateStructuredRitual({ title: "" }), /missing title/);
  assert.throws(() => validateStructuredRitual({ title: "Valid", description: "" }), /missing description/);
  assert.throws(() => validateStructuredRitual(null), /not an object/);
});

// 10. Duplicate ritual triggers at most one retry
await itAsync("10. Duplicate ritual triggers at most one retry", async () => {
  let calls = 0;
  const mockClient = {
    chat: {
      completions: {
        create: async () => {
          calls++;
          if (calls === 1) {
            // Attempt 1: Return a duplicate of recent ritual "The Thread Inventory"
            return {
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      title: "The Thread Inventory",
                      description: "Inspect three commitments and discard one.",
                      instructions: ["Inspect list", "Cut thread"],
                      durationMinutes: 15,
                      difficulty: "easy",
                      reflectionPrompt: "What was discarded?",
                      reason: "Re-examining threads.",
                    }),
                  },
                },
              ],
            };
          }
          // Attempt 2: Return a distinct new ritual
          return {
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    title: "The Unspooling Rite",
                    description: "Release lingering friction from yesterday's unfinished work.",
                    instructions: ["Name the friction", "Exhale and release"],
                    durationMinutes: 10,
                    difficulty: "easy",
                    reflectionPrompt: "What tension did you loosen?",
                    reason: "Responding to member reflection on unspooling tension.",
                  }),
                },
              },
            ],
          };
        },
      },
    },
  };

  // Mock DB models for unit test execution
  const originalFind = DailyRitual.find;
  const originalLogFind = RitualLog.find;
  const originalFindOneAndUpdate = DailyRitual.findOneAndUpdate;

  try {
    DailyRitual.find = () => ({
      sort: () => ({
        limit: () => ({
          lean: async () => sampleRecentRituals,
        }),
      }),
    });

    RitualLog.find = () => ({
      sort: () => ({
        limit: () => ({
          populate: () => ({
            lean: async () => sampleRecentLogs,
          }),
        }),
      }),
    });

    DailyRitual.findOneAndUpdate = async (query, update) => {
      return { _id: new mongoose.Types.ObjectId(), ...query, ...update.$setOnInsert };
    };

    const res = await generateDailyRitual(sampleCulture, "2026-09-12", { clientOverride: mockClient });
    assert.strictEqual(calls, 2, `Expected exactly 2 AI calls (1 initial + 1 retry), got ${calls}`);
    assert.strictEqual(res.title, "The Unspooling Rite", "Second attempt should be accepted");
  } finally {
    DailyRitual.find = originalFind;
    RitualLog.find = originalLogFind;
    DailyRitual.findOneAndUpdate = originalFindOneAndUpdate;
  }
});

// 11. Retry cannot loop indefinitely
await itAsync("11. Retry cannot loop indefinitely (capped at 2 attempts, handles gracefully)", async () => {
  let calls = 0;
  const mockClient = {
    chat: {
      completions: {
        create: async () => {
          calls++;
          // Always return duplicate of "The Thread Inventory"
          return {
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    title: "The Thread Inventory",
                    description: "Inspect three commitments.",
                    instructions: ["Inspect", "Cut"],
                    durationMinutes: 10,
                    difficulty: "easy",
                    reflectionPrompt: "Reflect?",
                    reason: "Routine check.",
                  }),
                },
              },
            ],
          };
        },
      },
    },
  };

  const originalFind = DailyRitual.find;
  const originalLogFind = RitualLog.find;
  const originalFindOneAndUpdate = DailyRitual.findOneAndUpdate;

  try {
    DailyRitual.find = () => ({
      sort: () => ({
        limit: () => ({
          lean: async () => sampleRecentRituals,
        }),
      }),
    });

    RitualLog.find = () => ({
      sort: () => ({
        limit: () => ({
          populate: () => ({
            lean: async () => sampleRecentLogs,
          }),
        }),
      }),
    });

    DailyRitual.findOneAndUpdate = async (query, update) => {
      return { _id: new mongoose.Types.ObjectId(), ...query, ...update.$setOnInsert };
    };

    const res = await generateDailyRitual(sampleCulture, "2026-09-12", { clientOverride: mockClient });
    assert.strictEqual(calls, 2, `Must stop at MAX_ATTEMPTS=2, did not loop indefinitely. Total calls: ${calls}`);
    assert.ok(res.title.includes("Variation"), "Gracefully adapted title after retry attempt");
  } finally {
    DailyRitual.find = originalFind;
    RitualLog.find = originalLogFind;
    DailyRitual.findOneAndUpdate = originalFindOneAndUpdate;
  }
});

// 12, 13, 14. Real database verification: Persistence, ritualId link, and memory loop
await itAsync("12, 13, 14. Persistence, ritualId linkage, and memory loop in MongoDB", async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log("  SKIP: MONGO_URI not found in env, skipping live DB verification");
    return;
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  // 12. Persistence: create a unique daily ritual document
  const testDate = `2099-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`;
  const testCultureId = new mongoose.Types.ObjectId();
  const testUserId = new mongoose.Types.ObjectId();

  const savedRitual = await DailyRitual.findOneAndUpdate(
    { cultureId: testCultureId, date: testDate },
    {
      $setOnInsert: {
        cultureId: testCultureId,
        date: testDate,
        title: "The Test Rite",
        description: "Verify persistence directly in DB.",
        instructions: ["Step A", "Step B"],
        durationMinutes: 10,
        difficulty: "easy",
        reflectionPrompt: "Did it save cleanly?",
        reason: "Test persistence.",
        ritualText: "The Test Rite: Verify persistence directly in DB.",
      },
    },
    { upsert: true, new: true }
  );

  assert.ok(savedRitual._id, "DailyRitual should have persisted _id");
  assert.strictEqual(savedRitual.date, testDate, "Date should match");

  // 13. ritualId behavior: RitualLog references DailyRitual
  const savedLog = await RitualLog.create({
    userId: testUserId,
    cultureId: testCultureId,
    ritualId: savedRitual._id,
    content: "Persisted log linked to saved daily ritual.",
  });

  assert.ok(savedLog._id, "RitualLog should have persisted _id");
  assert.strictEqual(savedLog.ritualId.toString(), savedRitual._id.toString(), "ritualId must match DailyRitual _id");

  // 14. Memory loop: query recent daily rituals and logs by cultureId
  const foundRituals = await DailyRitual.find({ cultureId: testCultureId }).lean();
  const foundLogs = await RitualLog.find({ cultureId: testCultureId }).lean();

  assert.strictEqual(foundRituals.length, 1, "Should find persisted daily ritual");
  assert.strictEqual(foundLogs.length, 1, "Should find persisted ritual log");
  assert.strictEqual(foundLogs[0].content, "Persisted log linked to saved daily ritual.");

  // Cleanup test docs
  await DailyRitual.deleteOne({ _id: savedRitual._id });
  await RitualLog.deleteOne({ _id: savedLog._id });
});

console.log("\n==========================================");
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log("==========================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
