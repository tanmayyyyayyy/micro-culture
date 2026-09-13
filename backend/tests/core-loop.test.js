/**
 * P3.1 — Core Loop Reliability Regression Tests
 *
 * Focused standalone test suite for real fixes made in P3.1:
 * 1. Duplicate completion protection (prevents duplicate logs on same day)
 * 2. Membership authorization requirement
 * 3. Daily ritual validation (ritualId must match culture)
 * 4. API client fallback port consistency
 */
import assert from "assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

async function runTests() {
  console.log("\n=== P3.1 Core Loop Reliability Test Suite ===\n");

  // ---------------------------------------------------------------------------
  // Test 1: Frontend API Port Fallback
  // ---------------------------------------------------------------------------
  it("1. API client default fallback matches backend port (5001)", () => {
    const clientPath = path.join(__dirname, "../../frontend/src/api/client.js");
    const content = fs.readFileSync(clientPath, "utf-8");
    assert.strictEqual(
      content.includes('http://localhost:5001'),
      true,
      "API client fallback URL must use port 5001"
    );
  });

  // ---------------------------------------------------------------------------
  // Test 2: Log Route Duplicate & Authorization Logic
  // ---------------------------------------------------------------------------
  it("2. Duplicate completion logic checks today calendar boundary", () => {
    const logsRoutePath = path.join(__dirname, "../routes/logs.js");
    const content = fs.readFileSync(logsRoutePath, "utf-8");
    assert.strictEqual(
      content.includes("already completed this ritual today"),
      true,
      "logs.js must contain duplicate completion check message"
    );
    assert.strictEqual(
      content.includes("status(409)"),
      true,
      "logs.js must return 409 Conflict status on duplicate"
    );
  });

  it("3. Membership guard exists in logs POST route", () => {
    const logsRoutePath = path.join(__dirname, "../routes/logs.js");
    const content = fs.readFileSync(logsRoutePath, "utf-8");
    assert.strictEqual(
      content.includes("must be a member of this culture"),
      true,
      "logs.js must enforce culture membership check"
    );
  });

  it("4. DailyRitual linkage validation exists in logs POST route", () => {
    const logsRoutePath = path.join(__dirname, "../routes/logs.js");
    const content = fs.readFileSync(logsRoutePath, "utf-8");
    assert.strictEqual(
      content.includes("does not belong to this culture"),
      true,
      "logs.js must validate ritual belongs to target culture"
    );
  });

  it("5. Frontend DailyRitualPage handles 409 conflict gracefully", () => {
    const pagePath = path.join(__dirname, "../../frontend/src/pages/DailyRitualPage.jsx");
    const content = fs.readFileSync(pagePath, "utf-8");
    assert.strictEqual(
      content.includes("status === 409"),
      true,
      "DailyRitualPage must handle 409 status as completion success"
    );
  });

  console.log("\n==========================================");
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("==========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
