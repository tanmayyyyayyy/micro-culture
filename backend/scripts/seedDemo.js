import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Culture from "../models/Culture.js";
import DailyRitual from "../models/DailyRitual.js";
import RitualLog from "../models/RitualLog.js";

// Helper for YYYY-MM-DD date format with day offset
function getDateOffset(offsetDays = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function runDemoSeed() {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ Demo seed is disabled in production.");
    throw new Error("Demo seed is disabled in production.");
  }

  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/microculture";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  console.log("🌱 Starting Micro Culture demo data seeding...");

  // 1. Seed Demo Users (deterministic by email)
  const defaultPasswordHash = await bcrypt.hash("demo123456", 10);
  const demoUserData = [
    { name: "Kaito Vance", email: "demo.kaito@microculture.local" },
    { name: "Elena Rostova", email: "demo.elena@microculture.local" },
    { name: "Marcus Chen", email: "demo.marcus@microculture.local" },
    { name: "Aaliyah Thorne", email: "demo.aaliyah@microculture.local" },
  ];

  const users = [];
  for (const uData of demoUserData) {
    const user = await User.findOneAndUpdate(
      { email: uData.email },
      {
        $setOnInsert: {
          name: uData.name,
          email: uData.email,
          passwordHash: defaultPasswordHash,
          joinedCultures: [],
          createdCultures: [],
        },
      },
      { upsert: true, new: true }
    );
    users.push(user);
  }

  const [kaito, elena, marcus, aaliyah] = users;

  // 2. Seed Demo Cultures (4 distinct cultures with varied activity levels)
  const cultureDefs = [
    {
      key: "nocturne-lens",
      name: "Nocturne Lens",
      description: "A community of night photographers exploring urban shadows, low-light long exposures, and nocturnal stillness.",
      vibeWords: ["reflective", "quiet", "nocturnal", "observant"],
      aesthetic: ["dark mode", "neon glow", "grainy monochrome", "long exposure"],
      values: ["patience in darkness", "seeing the unnoticed", "light preservation"],
      jargon: ["ISO-whisperer: sensor sensitivity mastery", "blue-hour: optimal dusk shooting window"],
      rituals: ["Capture a single light source after midnight", "Frame an empty street corner"],
      symbol: "🌙",
      color: "#6366f1",
      creator: kaito,
      members: [kaito, elena, marcus, aaliyah],
      isPublished: true,
      activityLevel: "highly_active",
    },
    {
      key: "sub-rosa-codex",
      name: "Sub Rosa Codex",
      description: "A slow-reading sanctuary dedicated to marginalia exchanges, tactile reading, and deep text contemplation.",
      vibeWords: ["scholarly", "contemplative", "unhurried", "literary"],
      aesthetic: ["warm parchment", "fountain pen ink", "leather-bound", "candlelight"],
      values: ["deliberate slowness", "margin annotations as dialogue", "tactile reading"],
      jargon: ["marginalia: thoughts written in book margins", "glossa: deep textual interpretation"],
      rituals: ["Annotate one page in ink", "Read 10 pages without digital distraction"],
      symbol: "📚",
      color: "#ec4899",
      creator: elena,
      members: [elena, kaito, marcus],
      isPublished: true,
      activityLevel: "active",
    },
    {
      key: "concrete-frequency",
      name: "Concrete Frequency",
      description: "Field recordists and sonic explorers capturing ambient city room tones and hidden environmental acoustics.",
      vibeWords: ["attentive", "experimental", "resonant", "ambient"],
      aesthetic: ["waveform visualizer", "brutalist concrete", "analog tape", "deep green"],
      values: ["active listening", "sonic geography", "finding music in noise"],
      jargon: ["room-tone: ambient quietude", "foley-walk: intentional listening stroll"],
      rituals: ["Record 30 seconds of ambient stillness", "Identify 3 distinct overlapping sounds"],
      symbol: "🎧",
      color: "#10b981",
      creator: marcus,
      members: [marcus, aaliyah],
      isPublished: true,
      activityLevel: "growing",
    },
    {
      key: "circuit-solder",
      name: "Circuit & Solder",
      description: "Hardware tinkers building minimal retro micro-controllers, custom mechanical switches, and copper artwork.",
      vibeWords: ["tinker", "tactile", "curious", "craft-focused"],
      aesthetic: ["copper PCB", "glowing LED", "amber CRT", "wirework"],
      values: ["repair over replace", "understanding the machine", "elegant circuits"],
      jargon: ["magic-smoke: component failure", "breadboard-mind: rapid prototyping"],
      rituals: ["Trace one circuit path", "Clean a soldering iron tip"],
      symbol: "⚡",
      color: "#f59e0b",
      creator: aaliyah,
      members: [aaliyah],
      isPublished: true,
      activityLevel: "new",
    },
  ];

  const seededCultures = {};

  for (const def of cultureDefs) {
    const culture = await Culture.findOneAndUpdate(
      { name: def.name },
      {
        $set: {
          description: def.description,
          vibeWords: def.vibeWords,
          aesthetic: def.aesthetic,
          values: def.values,
          jargon: def.jargon,
          rituals: def.rituals,
          symbol: def.symbol,
          color: def.color,
          creatorId: def.creator._id,
          members: def.members.map((m) => m._id),
          isPublished: def.isPublished,
        },
      },
      { upsert: true, new: true }
    );

    // Ensure users have culture in joinedCultures / createdCultures
    for (const member of def.members) {
      await User.findByIdAndUpdate(member._id, {
        $addToSet: { joinedCultures: culture._id },
      });
    }
    await User.findByIdAndUpdate(def.creator._id, {
      $addToSet: { createdCultures: culture._id },
    });

    seededCultures[def.key] = culture;
  }

  // 3. Seed DailyRituals & RitualLogs for each culture based on activity profile
  // Highly Active: 6 days of rituals & 12 logs
  const nocturne = seededCultures["nocturne-lens"];
  const nocturneDays = [0, -1, -2, -3, -4, -5];
  for (const dayOffset of nocturneDays) {
    const date = getDateOffset(dayOffset);
    const ritual = await DailyRitual.findOneAndUpdate(
      { cultureId: nocturne._id, date },
      {
        $set: {
          title: `Midnight Shadow Scan (Day ${Math.abs(dayOffset)})`,
          description: "Step outside or look from your window. Capture or describe the highest contrast shadow scene.",
          instructions: [
            "Find a single direct light source casting long shadows.",
            "Observe the gradient between dark and light for 60 seconds.",
            "Log your observation or framing choice.",
          ],
          durationMinutes: 10,
          difficulty: "easy",
          reflectionPrompt: "What unseen detail did the darkness reveal tonight?",
          reason: "Reinforcing patience in low-light observation based on recent group logs.",
        },
      },
      { upsert: true, new: true }
    );

    // Logs for Nocturne
    const logEntries = [
      { user: kaito, content: "Framed an alley lamp reflecting off wet asphalt. ISO 800, 2-second exposure." },
      { user: elena, content: "Noticed the harsh shadows cast by streetlights through window blinds." },
      { user: marcus, content: "Captured a neon storefront sign glowing softly in the drizzle." },
    ];

    for (const entry of logEntries) {
      await RitualLog.findOneAndUpdate(
        { userId: entry.user._id, cultureId: nocturne._id, ritualId: ritual._id },
        {
          $set: {
            content: entry.content,
          },
        },
        { upsert: true, new: true }
      );
    }
  }

  // Active / Established: 4 days of rituals
  const subRosa = seededCultures["sub-rosa-codex"];
  const subRosaDays = [0, -1, -2, -3];
  for (const dayOffset of subRosaDays) {
    const date = getDateOffset(dayOffset);
    const ritual = await DailyRitual.findOneAndUpdate(
      { cultureId: subRosa._id, date },
      {
        $set: {
          title: `Marginalia Entry #${Math.abs(dayOffset) + 1}`,
          description: "Select one paragraph from your current read. Write a thoughtful handwritten margin note.",
          instructions: [
            "Read 5 pages slowly.",
            "Underline one sentence that makes you pause.",
            "Write a short response directly in the book margin or notebook.",
          ],
          durationMinutes: 15,
          difficulty: "medium",
          reflectionPrompt: "What connection did you make between the text and your day?",
          reason: "Fostering deeper textual commentary among active readers.",
        },
      },
      { upsert: true, new: true }
    );

    const logEntries = [
      { user: elena, content: "Annotated chapter 3 on slowness. Added a note comparing it to penmanship." },
      { user: kaito, content: "Wrote a margin note questioning the author's premise on memory retention." },
    ];

    for (const entry of logEntries) {
      await RitualLog.findOneAndUpdate(
        { userId: entry.user._id, cultureId: subRosa._id, ritualId: ritual._id },
        {
          $set: {
            content: entry.content,
          },
        },
        { upsert: true, new: true }
      );
    }
  }

  // Growing: 2 days of rituals
  const concrete = seededCultures["concrete-frequency"];
  const concreteDays = [0, -1];
  for (const dayOffset of concreteDays) {
    const date = getDateOffset(dayOffset);
    const ritual = await DailyRitual.findOneAndUpdate(
      { cultureId: concrete._id, date },
      {
        $set: {
          title: `Room Tone Survey #${Math.abs(dayOffset) + 1}`,
          description: "Sit quietly for 3 minutes. Record or describe the fundamental background frequency.",
          instructions: [
            "Close your eyes.",
            "Isolate HVAC hum, distant traffic, or wind noise.",
            "Describe the pitch and texture of the room tone.",
          ],
          durationMinutes: 5,
          difficulty: "easy",
          reflectionPrompt: "How does quietness change your perception of space?",
          reason: "Building baseline listening habits for new recordists.",
        },
      },
      { upsert: true, new: true }
    );

    await RitualLog.findOneAndUpdate(
      { userId: marcus._id, cultureId: concrete._id, ritualId: ritual._id },
      {
        $set: {
          content: "Recorded 45Hz hum from the transformer down the hall. Unexpectedly soothing tone.",
        },
      },
      { upsert: true, new: true }
    );
  }

  // New: 1 day ritual (today)
  const circuit = seededCultures["circuit-solder"];
  const circuitDate = getDateOffset(0);
  const circuitRitual = await DailyRitual.findOneAndUpdate(
    { cultureId: circuit._id, date: circuitDate },
    {
      $set: {
        title: "Founding Circuit Inspection",
        description: "Examine a piece of vintage or modern hardware. Identify its primary clock generator.",
        instructions: [
          "Open or inspect an old circuit board.",
          "Locate the quartz crystal oscillator.",
          "Note its printed frequency.",
        ],
        durationMinutes: 10,
        difficulty: "easy",
        reflectionPrompt: "What piece of hardware sparked your curiosity today?",
        reason: "Initial founding ritual for micro-controller enthusiasts.",
      },
    },
    { upsert: true, new: true }
  );

  await RitualLog.findOneAndUpdate(
    { userId: aaliyah._id, cultureId: circuit._id, ritualId: circuitRitual._id },
    {
      $set: {
        content: "Inspected a 1994 synthesizer PCB. Found a pristine 12.000 MHz crystal oscillator.",
      },
    },
    { upsert: true, new: true }
  );

  console.log("✅ Demo data seeding completed successfully.");
}

// Standalone execution entrypoint
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemoSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Demo seed failed:", err.message);
      process.exit(1);
    });
}
