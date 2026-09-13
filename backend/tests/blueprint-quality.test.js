/**
 * Focused test suite for AI Culture Blueprint Quality (P2.5)
 * Tests:
 * 1. User idea appears meaningfully in generated blueprint prompt context
 * 2. Values are unique (duplicates rejected)
 * 3. Rituals are unique (duplicates rejected)
 * 4. Jargon terms are unique (duplicate terms rejected)
 * 5. Jargon definitions exist (formatted with term: definition, non-empty)
 * 6. Generic/cliché output is rejected (single-word platitudes, wellness tropes)
 * 7. Schema remains valid and backwards compatible
 * 8. Validation error triggers at most ONE retry
 * 9. Retry cannot loop indefinitely and applies graceful fallback
 * 10. Existing culture model and persistence compatibility
 */
import assert from "assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

import {
  buildCultureBlueprintPrompt,
  validateBlueprint,
  generateCultureBlueprint,
} from "../routes/ai.js";
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

console.log("=== AI Culture Blueprint Quality Test Suite (P2.5) ===\n");

// 1. User idea appears meaningfully in prompt context
it("1. User idea appears meaningfully in generated prompt context", () => {
  const prompt = buildCultureBlueprintPrompt({
    name: "Midnight Cartographers",
    description: "Mapping forgotten nocturnal alleyways and abandoned celestial lines.",
    vibeWords: ["obsidian ink", "low brass", "starlight"],
  });

  assert.ok(prompt.includes("Midnight Cartographers"), "Culture name must be in prompt");
  assert.ok(prompt.includes("Mapping forgotten nocturnal alleyways"), "Description must be in prompt");
  assert.ok(prompt.includes("obsidian ink"), "Vibe keywords must be in prompt");
  assert.ok(prompt.includes("USER CONCEPT PRIORITY"), "Must emphasize user concept priority");
});

// 2. Values are unique
it("2. Values are unique (duplicates rejected)", () => {
  const valid = validateBlueprint({
    values: [
      "The Uninscribed Margin: seeking the uncharted",
      "Nocturnal Vigil: honoring the quiet hours",
      "Cartographic Fidelity: recording true discovery",
    ],
    jargon: [
      "contour: an emotional boundary",
      "azimuth: one's true creative orientation",
      "unspool: release backlog tension",
    ],
    rituals: [
      "The First Inscription: ink a single observed star at dusk",
      "Midnight Traverse: walk an unmapped block without GPS",
      "Compass Burial: let go of a dead trajectory",
    ],
    aesthetic: ["matte obsidian", "raw vellum", "lantern brass"],
    symbol: "🗺️",
  });

  assert.strictEqual(valid.values.length, 3);

  // Duplicates test
  assert.throws(
    () =>
      validateBlueprint({
        values: ["Patience", "patience", "Integrity"],
        jargon: ["a: b", "c: d", "e: f"],
        rituals: [
          "The First Inscription: mark a point",
          "The Second Inscription: mark a line",
          "The Third Inscription: mark a circle",
        ],
        aesthetic: ["ink", "paper", "slate"],
      }),
    /at least 3 distinct values/
  );
});

// 3. Rituals are unique
it("3. Rituals are unique (duplicates rejected)", () => {
  assert.throws(
    () =>
      validateBlueprint({
        values: ["Valor and grit", "Silent resolve", "Deep observation"],
        jargon: ["forge: place of creation", "anvil: steady baseline", "temper: patience"],
        rituals: [
          "Light the forge at dawn and observe",
          "Light the forge at dawn and observe", // duplicate
          "Quench the iron in cold rainwater",
        ],
        aesthetic: ["hammered iron", "charcoal dust", "ember glow"],
      }),
    /at least 3 distinct founding rituals/
  );
});

// 4. Jargon terms are unique
it("4. Jargon terms are unique (duplicate terms rejected)", () => {
  assert.throws(
    () =>
      validateBlueprint({
        values: ["Valor and grit", "Silent resolve", "Deep observation"],
        jargon: [
          "contour: an emotional boundary",
          "Contour: another definition of contour", // duplicate term
          "azimuth: orientation",
        ],
        rituals: [
          "Walk the outer perimeter at dawn",
          "Write the coordinates of one discovery",
          "Fold the map before twilight sets in",
        ],
        aesthetic: ["slate", "indigo", "chalk"],
      }),
    /at least 3 defined jargon terms/
  );
});

// 5. Jargon definitions exist
it("5. Jargon definitions exist (formatted with term: definition, non-empty)", () => {
  // Missing delimiter or empty definition
  assert.throws(
    () =>
      validateBlueprint(
        {
          values: ["Valor and grit", "Silent resolve", "Deep observation"],
          jargon: ["codex", "azimuth: orientation", "contour: boundary"],
          rituals: [
            "Walk the outer perimeter at dawn",
            "Write the coordinates of one discovery",
            "Fold the map before twilight sets in",
          ],
          aesthetic: ["slate", "indigo", "chalk"],
        },
        { strict: true }
      ),
    /missing definition delimiter/
  );

  assert.throws(
    () =>
      validateBlueprint(
        {
          values: ["Valor and grit", "Silent resolve", "Deep observation"],
          jargon: ["contour:  ", "azimuth: orientation", "warp: foundational principle"],
          rituals: [
            "Walk the outer perimeter at dawn",
            "Write the coordinates of one discovery",
            "Fold the map before twilight sets in",
          ],
          aesthetic: ["slate", "indigo", "chalk"],
        },
        { strict: true }
      ),
    /insufficient or missing definition/
  );
});

// 6. Generic / cliché output is rejected
it("6. Generic/cliché output is rejected (single-word platitudes & generic wellness)", () => {
  // Cliché values
  assert.throws(
    () =>
      validateBlueprint({
        values: ["community", "growth", "creativity"],
        jargon: ["warp: foundational principle", "anvil: steady baseline", "temper: patience"],
        rituals: [
          "Walk the perimeter in stillness",
          "Record one discovery on parchment",
          "Fold the map before midnight",
        ],
        aesthetic: ["charcoal", "parchment", "iron"],
      }),
    /generic cliché/
  );

  // Cliché rituals
  assert.throws(
    () =>
      validateBlueprint({
        values: ["Nocturnal Clarity", "Inscribed Silence", "Careful Craft"],
        jargon: ["warp: foundational principle", "anvil: steady baseline", "temper: patience"],
        rituals: [
          "Take a moment to reflect on your day and breathe",
          "Record one discovery on parchment",
          "Fold the map before midnight",
        ],
        aesthetic: ["charcoal", "parchment", "iron"],
      }),
    /generic self-help clichés/
  );

  // Cliché aesthetics
  assert.throws(
    () =>
      validateBlueprint({
        values: ["Nocturnal Clarity", "Inscribed Silence", "Careful Craft"],
        jargon: ["warp: foundational principle", "anvil: steady baseline", "temper: patience"],
        rituals: [
          "Inscribe three coordinates in ink",
          "Walk the quiet perimeter at midnight",
          "Extinguish the desk lantern slowly",
        ],
        aesthetic: ["minimal", "modern", "clean"],
      }),
    /solely generic buzzwords/
  );
});

// 7. Schema remains valid and backwards compatible
it("7. Schema remains valid and backwards compatible", () => {
  const result = validateBlueprint({
    aesthetic: ["slate", "indigo linen", "lantern brass"],
    values: ["Patience in the dark", "Precision of lines", "True north"],
    jargon: ["azimuth: true direction", "contour: boundary of focus", "scale: proportion"],
    rituals: [
      "Examine one commitment and trim it",
      "Sit in 10 minutes of complete silence",
      "Sketch the topography of yesterday's effort",
    ],
    symbol: "🧭",
  });

  assert.ok(Array.isArray(result.aesthetic), "aesthetic must be an array");
  assert.ok(Array.isArray(result.values), "values must be an array");
  assert.ok(Array.isArray(result.jargon), "jargon must be an array");
  assert.ok(Array.isArray(result.rituals), "rituals must be an array");
  assert.strictEqual(typeof result.symbol, "string", "symbol must be a string");
  assert.strictEqual(result.symbol, "🧭");
});

// 8. Validation error triggers at most ONE retry
await itAsync("8. Validation error triggers at most ONE retry", async () => {
  let calls = 0;
  const mockClient = {
    chat: {
      completions: {
        create: async () => {
          calls++;
          if (calls === 1) {
            // Attempt 1: Return cliché single-word values
            return {
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      values: ["community", "growth", "creativity"],
                      jargon: ["a: b", "c: d", "e: f"],
                      rituals: [
                        "Walk the outer perimeter at dawn",
                        "Record one discovery on parchment",
                        "Fold the map before midnight",
                      ],
                      aesthetic: ["slate", "indigo", "chalk"],
                      symbol: "🧭",
                    }),
                  },
                },
              ],
            };
          }
          // Attempt 2: Return high-quality, culturally specific values
          return {
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    values: [
                      "Nocturnal Vigil: honoring midnight silence",
                      "Cartographic Honor: honest charting",
                      "The Blank Margin: reverence for the unknown",
                    ],
                    jargon: [
                      "azimuth: inner alignment",
                      "contour: protective boundary",
                      "meridian: midday focus block",
                    ],
                    rituals: [
                      "Inscribe three coordinates in ink",
                      "Walk the quiet perimeter at midnight",
                      "Extinguish the desk lantern slowly",
                    ],
                    aesthetic: ["matte obsidian", "raw vellum", "lantern brass"],
                    symbol: "🧭",
                  }),
                },
              },
            ],
          };
        },
      },
    },
  };

  const bp = await generateCultureBlueprint({
    name: "Midnight Cartographers",
    description: "Nocturnal mapping society.",
    clientOverride: mockClient,
  });

  assert.strictEqual(calls, 2, "Must trigger exactly 1 retry (total 2 calls)");
  assert.ok(bp.values[0].includes("Nocturnal Vigil"), "Second attempt blueprint returned");
});

// 9. Retry cannot loop indefinitely and applies graceful fallback
await itAsync("9. Retry cannot loop indefinitely and applies graceful fallback", async () => {
  let calls = 0;
  const mockClient = {
    chat: {
      completions: {
        create: async () => {
          calls++;
          // Always return broken / cliché blueprint
          return {
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    values: ["community", "growth", "respect"],
                    jargon: ["none", "none", "none"],
                    rituals: ["reflect", "breathe", "smile"],
                    aesthetic: ["cool", "nice", "clean"],
                    symbol: "✨",
                  }),
                },
              },
            ],
          };
        },
      },
    },
  };

  const bp = await generateCultureBlueprint({
    name: "Persistent Society",
    description: "A persistent collective.",
    clientOverride: mockClient,
  });

  assert.strictEqual(calls, 2, "Must terminate strictly after MAX_ATTEMPTS=2 without infinite looping");
  assert.ok(bp.values.length >= 3, "Graceful fallback ensures valid values exist");
  assert.ok(bp.jargon.length >= 3, "Graceful fallback ensures valid jargon exists");
  assert.ok(bp.rituals.length >= 1, "Graceful fallback ensures valid rituals exist");
});

// 10. Existing culture model and persistence compatibility
await itAsync("10. Validated blueprint fields persist cleanly to Culture model", async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log("  SKIP: MONGO_URI not found");
    return;
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  const validBlueprint = {
    aesthetic: ["matte obsidian", "raw vellum", "lantern brass"],
    values: ["Nocturnal Vigil", "Cartographic Honor", "The Blank Margin"],
    jargon: ["azimuth: inner alignment", "contour: boundary", "meridian: peak focus"],
    rituals: ["Inscribe 3 coordinates", "Walk perimeter", "Extinguish lantern"],
    symbol: "🧭",
  };

  const testCreator = new mongoose.Types.ObjectId();
  const culture = await Culture.create({
    name: "Blueprint Compatibility Test",
    description: "Testing schema persistence with upgraded blueprint.",
    vibeWords: ["nocturnal", "precise"],
    aesthetic: validBlueprint.aesthetic,
    values: validBlueprint.values,
    jargon: validBlueprint.jargon,
    rituals: validBlueprint.rituals,
    symbol: validBlueprint.symbol,
    color: "#8b5cf6",
    creatorId: testCreator,
    members: [testCreator],
    isPublished: true,
  });

  assert.ok(culture._id, "Culture must be persisted");
  assert.strictEqual(culture.values.length, 3);
  assert.strictEqual(culture.jargon.length, 3);
  assert.strictEqual(culture.rituals.length, 3);
  assert.strictEqual(culture.symbol, "🧭");

  // Cleanup
  await Culture.deleteOne({ _id: culture._id });
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
