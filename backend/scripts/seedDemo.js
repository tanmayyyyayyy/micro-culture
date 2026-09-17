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

  // ---------------------------------------------------------------------------
  // STEP 0: Remove known QA/test artifacts (idempotent — safe to run multiple times)
  // Aetheria Collective — created by test@microculture.dev (confirmed QA artifact)
  // P0 Test Culture    — created by testauth_p0@test.com  (confirmed P0 QA artifact)
  // ---------------------------------------------------------------------------
  const QA_CULTURE_NAMES = ["Aetheria Collective", "P0 Test Culture"];
  const qaCultures = await Culture.find({ name: { $in: QA_CULTURE_NAMES } }).lean();
  if (qaCultures.length > 0) {
    const qaCultureIds = qaCultures.map((c) => c._id);
    await RitualLog.deleteMany({ cultureId: { $in: qaCultureIds } });
    await DailyRitual.deleteMany({ cultureId: { $in: qaCultureIds } });
    await Culture.deleteMany({ _id: { $in: qaCultureIds } });
    console.log(`🧹 Removed ${qaCultures.length} QA test culture(s): ${QA_CULTURE_NAMES.join(", ")}`);
  }

  // ---------------------------------------------------------------------------
  // STEP 1: Seed Demo Users (deterministic by email — upserted, never duplicated)
  // ---------------------------------------------------------------------------
  const defaultPasswordHash = await bcrypt.hash("demo123456", 10);
  const demoUserData = [
    // Original 4 demo users
    { name: "Kaito Vance",    email: "demo.kaito@microculture.local" },
    { name: "Elena Rostova",  email: "demo.elena@microculture.local" },
    { name: "Marcus Chen",    email: "demo.marcus@microculture.local" },
    { name: "Aaliyah Thorne", email: "demo.aaliyah@microculture.local" },
    // New demo users for accessible communities
    { name: "Arjun Mehta",    email: "demo.arjun@microculture.local" },
    { name: "Priya Sharma",   email: "demo.priya@microculture.local" },
    { name: "Dev Patel",      email: "demo.dev@microculture.local" },
    { name: "Sam Rivera",     email: "demo.sam@microculture.local" },
    { name: "Rio Nakamura",   email: "demo.rio@microculture.local" },
    { name: "Mia Okonkwo",    email: "demo.mia@microculture.local" },
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

  const [kaito, elena, marcus, aaliyah, arjun, priya, dev, sam, rio, mia] = users;

  // ---------------------------------------------------------------------------
  // STEP 2: Seed All Cultures (idempotent upsert by name)
  // ---------------------------------------------------------------------------
  const cultureDefs = [
    // ── Original Creative / Niche Communities ──────────────────────────────
    {
      key: "nocturne-lens",
      name: "Nocturne Lens",
      description: "A community of night photographers exploring urban shadows, low-light long exposures, and nocturnal stillness.",
      vibeWords: ["reflective", "quiet", "nocturnal", "observant"],
      aesthetic: ["dark mode", "neon glow", "grainy monochrome", "long exposure"],
      values: ["patience in darkness", "seeing the unnoticed", "light preservation"],
      jargon: [
        "ISO-whisperer: mastery of sensor sensitivity in near-zero light conditions",
        "blue-hour: the optimal twilight window before full darkness falls",
        "ghost-frame: a long-exposure frame capturing motion as translucent trails",
      ],
      rituals: [
        "Capture a single light source after midnight and describe its quality in writing",
        "Frame an empty street corner and identify what draws the eye",
        "Spend five minutes observing how shadows change as a light source moves",
      ],
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
      jargon: [
        "marginalia: thoughts handwritten directly into book margins during reading",
        "glossa: a deep textual interpretation shared between community readers",
        "scriptorium-hour: a designated time for distraction-free reading in silence",
      ],
      rituals: [
        "Annotate one page in ink with a thought the author did not say explicitly",
        "Read 10 pages without digital distraction and note what surprised you",
        "Write one sentence that captures the mood of your current chapter",
      ],
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
      jargon: [
        "room-tone: the unique ambient quietude that defines a specific physical space",
        "foley-walk: an intentional listening stroll to collect environmental sounds",
        "spectral-map: a mental or visual record of layered sounds in a given location",
      ],
      rituals: [
        "Record 30 seconds of ambient stillness and describe the dominant frequency",
        "Identify 3 distinct overlapping sounds in your immediate environment",
        "Close your eyes for 2 minutes and sketch a sound map of the space around you",
      ],
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
      jargon: [
        "magic-smoke: the irreversible component failure that occurs when current is too high",
        "breadboard-mind: a rapid prototyping approach to solving problems with improvised parts",
        "flux-ritual: the careful preparation and cleaning of a solder joint before committing",
      ],
      rituals: [
        "Trace one complete circuit path and describe the function of each component",
        "Clean a soldering iron tip and test the joint quality on scrap board",
        "Identify one component in an old device you own and look up its datasheet",
      ],
      symbol: "⚡",
      color: "#f59e0b",
      creator: aaliyah,
      members: [aaliyah],
      isPublished: true,
      activityLevel: "new",
    },

    // ── Accessible / Familiar Communities ──────────────────────────────────
    {
      key: "cricket-club",
      name: "Cricket Club",
      description: "A community for people who love cricket — from match-day discussions and predictions to memorable moments and weekly challenges.",
      vibeWords: ["energetic", "social", "competitive", "passionate"],
      aesthetic: ["green outfield", "red leather seam", "stadium lights", "chalk boundary"],
      values: [
        "playing with full commitment every time",
        "team rhythm over individual glory",
        "celebrating the craft of the game",
      ],
      jargon: [
        "matchday-mind: the focused, pre-game mental state a player or fan enters before play",
        "corridor-of-uncertainty: the delivery length that makes a batter second-guess every instinct",
        "last-over-nerve: the collective tension felt when a match swings to its final moments",
      ],
      rituals: [
        "Pick one moment from a recent match and explain in three sentences why you remember it",
        "Make your prediction for the next match result and record your reasoning",
        "Describe one cricket technique or shot you admire and why it is effective",
      ],
      symbol: "🏏",
      color: "#16a34a",
      creator: arjun,
      members: [arjun, priya, dev, sam, rio, mia, kaito, elena, marcus, aaliyah],
      isPublished: true,
      activityLevel: "highly_active",
    },
    {
      key: "lofi-corner",
      name: "Lo-fi Corner",
      description: "A relaxed community for people who listen to lo-fi / lofi music while studying, working, creating, or simply slowing down.",
      vibeWords: ["calm", "cozy", "focused", "creative", "lofi"],
      aesthetic: ["rainy window haze", "warm lamp glow", "cassette grain", "analog static"],
      values: [
        "protecting focused attention from noise",
        "finding calm as a daily practice",
        "letting sound shape the quality of time",
      ],
      jargon: [
        "deep-focus-hour: a protected time block in which only ambient music and the task are allowed",
        "crate-dig: the practice of searching for lesser-known tracks to add to a shared listening list",
        "room-listen: giving complete attention to a track without multitasking, even for one song",
      ],
      rituals: [
        "Listen to one lo-fi track without multitasking and note one detail you normally miss",
        "Share your current focus track and what you were working on while it played",
        "Find one artist or album you have never heard before and describe your first impression",
      ],
      symbol: "🎵",
      color: "#8b5cf6",
      creator: mia,
      members: [mia, priya, sam, rio, elena, marcus],
      isPublished: true,
      activityLevel: "active",
    },
    {
      key: "dsa-coding",
      name: "DSA & Coding",
      description: "A community for people learning to code, solve DSA problems, and build projects together through daily practice and shared progress.",
      vibeWords: ["focused", "curious", "collaborative", "methodical"],
      aesthetic: ["terminal green", "dark IDE", "monospace type", "diff highlights"],
      values: [
        "consistency over intensity in daily practice",
        "understanding deeply before moving on",
        "sharing the stuck moments as openly as the wins",
      ],
      jargon: [
        "rubber-duck-log: writing out your problem in plain English before touching code to clarify thinking",
        "brute-first: intentionally solving with the naive approach before optimizing",
        "pattern-lock: the moment a recurring DSA pattern becomes instinctive and automatic",
      ],
      rituals: [
        "Solve one array or string problem without hints and write where you got stuck",
        "Read one solution you did not arrive at yourself and explain it in your own words",
        "Share your current project or learning goal and one concrete step you took today",
      ],
      symbol: "💻",
      color: "#06b6d4",
      creator: dev,
      members: [dev, arjun, sam, priya, rio, mia, kaito, marcus, elena, aaliyah],
      isPublished: true,
      activityLevel: "highly_active",
    },
    {
      key: "gaming-lounge",
      name: "Gaming Lounge",
      description: "A community for gamers to share games, memorable moments, challenges, and what they are currently playing.",
      vibeWords: ["fun", "competitive", "social", "playful"],
      aesthetic: ["neon controller", "RGB glow", "pixelated sprites", "loading screen static"],
      values: [
        "playing games that are worth your time",
        "sharing moments that make gaming memorable",
        "competing with curiosity not just aggression",
      ],
      jargon: [
        "main-character-moment: a play that felt cinematic and perfectly timed in the flow of a session",
        "session-ender: a single match or run so memorable it makes you stop playing on a high note",
        "meta-blind: choosing to play off-meta deliberately to rediscover what the game actually is",
      ],
      rituals: [
        "Describe one gaming moment from this week that you wish you could replay and why",
        "Share one game you are currently playing and what keeps pulling you back to it",
        "Set a challenge for yourself in your current game and report back tomorrow",
      ],
      symbol: "🎮",
      color: "#ef4444",
      creator: sam,
      members: [sam, rio, dev, arjun, mia, marcus],
      isPublished: true,
      activityLevel: "growing",
    },
    {
      key: "book-club",
      name: "Book Club",
      description: "A community for people who enjoy reading and want to share books, ideas, quotes, and thoughtful recommendations.",
      vibeWords: ["thoughtful", "curious", "relaxed", "reflective"],
      aesthetic: ["dog-eared pages", "soft afternoon light", "underlined sentences", "worn spine"],
      values: [
        "reading as a way of thinking alongside others",
        "choosing books that challenge a comfortable perspective",
        "sharing what a book made you feel, not just what happened",
      ],
      jargon: [
        "spine-creak: the specific pleasure of opening a new or well-loved book for the first time",
        "page-gravity: the invisible pull that makes it impossible to stop at a chapter break",
        "slow-read: the intentional practice of pacing through a book without rushing to finish",
      ],
      rituals: [
        "Share one sentence from your current read that stopped you — no context needed",
        "Recommend one book you return to repeatedly and say what brings you back",
        "Write two sentences describing the mood of what you are reading right now",
      ],
      symbol: "📖",
      color: "#d97706",
      creator: elena,
      members: [elena, priya, mia, kaito, sam, rio],
      isPublished: true,
      activityLevel: "active",
    },
    {
      key: "movie-nights",
      name: "Movie Nights",
      description: "A community for people who love movies — discovering, discussing, and recommending films across any genre or era.",
      vibeWords: ["cinematic", "social", "curious", "conversational"],
      aesthetic: ["projector grain", "dark theatre", "film reel amber", "credits roll"],
      values: [
        "watching films that earn your full attention",
        "discussing what a film made you feel, not just rate",
        "finding something worth watching in every genre",
      ],
      jargon: [
        "cold-open-hook: the first scene quality that determines whether you will finish the film",
        "rewatch-test: whether a film holds up, reveals new layers, or collapses on a second viewing",
        "watchlist-debt: the growing list of films you have promised yourself to watch",
      ],
      rituals: [
        "Recommend one film from your watchlist that you think more people should see",
        "Describe a scene from a recent film that stayed with you after it ended",
        "Pick one director or filmmaker you love and explain what makes their work distinctive",
      ],
      symbol: "🎬",
      color: "#7c3aed",
      creator: rio,
      members: [rio, mia, sam, priya, arjun, elena, kaito],
      isPublished: true,
      activityLevel: "active",
    },
    {
      key: "photography-walks",
      name: "Photography Walks",
      description: "A community for people who enjoy taking photos, exploring new places, and noticing everyday details most people walk past.",
      vibeWords: ["creative", "curious", "exploratory", "observant"],
      aesthetic: ["golden hour dust", "street shadow geometry", "candid blur", "natural frame"],
      values: [
        "slowing down enough to actually see the scene",
        "finding the interesting shot in the ordinary place",
        "sharing the process as much as the final image",
      ],
      jargon: [
        "frame-instinct: the practiced reflex of seeing a composition before raising the camera",
        "walk-and-observe: a dedicated outing where the goal is noticing, not capturing",
        "decisive-window: the brief moment when light, subject, and background align perfectly",
      ],
      rituals: [
        "Take one photo today of something you walked past before without noticing",
        "Describe the light in your current location in three words",
        "Share a photo that you almost did not take and explain what made you stop",
      ],
      symbol: "📷",
      color: "#0891b2",
      creator: priya,
      members: [priya, kaito, mia, sam, rio],
      isPublished: true,
      activityLevel: "growing",
    },
    {
      key: "fitness-together",
      name: "Fitness Together",
      description: "A community for people working on movement consistency, building healthier daily habits, and staying accountable together.",
      vibeWords: ["positive", "active", "supportive", "consistent"],
      aesthetic: ["chalk dust", "early morning grey", "worn grip tape", "progress marks"],
      values: [
        "showing up on the hard days above all others",
        "consistency as the only sustainable strategy",
        "celebrating small progress as real progress",
      ],
      jargon: [
        "minimum-viable-rep: the smallest workout you commit to doing on a low-energy day to maintain the habit",
        "active-rest: intentional light movement on recovery days rather than full inactivity",
        "progress-log: a brief honest record of what you did today, without comparing to yesterday",
      ],
      rituals: [
        "Log what you did for movement today — any activity counts, even a walk",
        "Share one habit or routine that has actually stuck for you and why it worked",
        "Set one specific movement goal for tomorrow and write it down now",
      ],
      symbol: "💪",
      color: "#dc2626",
      creator: arjun,
      members: [arjun, dev, sam, rio, mia, priya, kaito, marcus],
      isPublished: true,
      activityLevel: "active",
    },
    {
      key: "music-discovery",
      name: "Music Discovery",
      description: "A community for people who enjoy finding new songs, artists, genres, and sounds they have never heard before.",
      vibeWords: ["expressive", "curious", "energetic", "eclectic"],
      aesthetic: ["spectrum equalizer", "vinyl groove", "concert poster", "faded liner notes"],
      values: [
        "following a sound wherever it leads without genre prejudice",
        "sharing discovery as generously as receiving it",
        "listening to a full album before forming a verdict",
      ],
      jargon: [
        "deep-cut: a track buried in an album or catalogue that most listeners never reach",
        "sonic-thread: the invisible musical connection linking one discovery to the next",
        "first-listen-feeling: the unfiltered emotional reaction before familiarity sets in",
      ],
      rituals: [
        "Share one song you discovered this week and describe how you found it",
        "Pick one artist you have never listened to and spend 15 minutes with their work",
        "Describe your first-listen-feeling for a recent discovery in two sentences",
      ],
      symbol: "🎶",
      color: "#f59e0b",
      creator: mia,
      members: [mia, rio, priya, sam, arjun, elena],
      isPublished: true,
      activityLevel: "growing",
    },
    {
      key: "travel-stories",
      name: "Travel Stories",
      description: "A community for people who enjoy exploring new places and sharing travel ideas, memories, and unexpected discoveries.",
      vibeWords: ["adventurous", "curious", "open", "experiential"],
      aesthetic: ["worn map fold", "passport stamp", "window seat light", "local market colour"],
      values: [
        "going somewhere to understand it, not just to see it",
        "collecting experiences over photographs",
        "sharing what was actually surprising about a place",
      ],
      jargon: [
        "getting-lost-on-purpose: the deliberate act of wandering without a map or itinerary",
        "local-hour: the time of day when a place reveals its actual rhythm and character",
        "slow-travel: spending enough time in one place to stop feeling like a tourist",
      ],
      rituals: [
        "Share a memory from a place that surprised you — what did you expect and what did you find",
        "Describe one place on your list and what specifically draws you to it",
        "Tell us one thing a place taught you that you could not have learned at home",
      ],
      symbol: "✈️",
      color: "#0284c7",
      creator: rio,
      members: [rio, priya, sam, mia, arjun],
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

  // ---------------------------------------------------------------------------
  // STEP 3: Seed DailyRituals & RitualLogs
  // ---------------------------------------------------------------------------

  // ── Nocturne Lens — Highly Active (6 days, 3 logs/day) ────────────────────
  const nocturne = seededCultures["nocturne-lens"];
  for (const dayOffset of [0, -1, -2, -3, -4, -5]) {
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
    for (const entry of [
      { user: kaito,   content: "Framed an alley lamp reflecting off wet asphalt. ISO 800, 2-second exposure." },
      { user: elena,   content: "Noticed the harsh shadows cast by streetlights through window blinds." },
      { user: marcus,  content: "Captured a neon storefront sign glowing softly in the drizzle." },
    ]) {
      await RitualLog.findOneAndUpdate(
        { userId: entry.user._id, cultureId: nocturne._id, ritualId: ritual._id },
        { $set: { content: entry.content } },
        { upsert: true, new: true }
      );
    }
  }

  // ── Sub Rosa Codex — Active (4 days, 2 logs/day) ──────────────────────────
  const subRosa = seededCultures["sub-rosa-codex"];
  for (const dayOffset of [0, -1, -2, -3]) {
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
    for (const entry of [
      { user: elena, content: "Annotated chapter 3 on slowness. Added a note comparing it to penmanship." },
      { user: kaito, content: "Wrote a margin note questioning the author's premise on memory retention." },
    ]) {
      await RitualLog.findOneAndUpdate(
        { userId: entry.user._id, cultureId: subRosa._id, ritualId: ritual._id },
        { $set: { content: entry.content } },
        { upsert: true, new: true }
      );
    }
  }

  // ── Concrete Frequency — Growing (2 days, 1 log/day) ─────────────────────
  const concrete = seededCultures["concrete-frequency"];
  for (const dayOffset of [0, -1]) {
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
      { $set: { content: "Recorded 45Hz hum from the transformer down the hall. Unexpectedly soothing tone." } },
      { upsert: true, new: true }
    );
  }

  // ── Circuit & Solder — New (1 day, 1 log) ─────────────────────────────────
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
    { $set: { content: "Inspected a 1994 synthesizer PCB. Found a pristine 12.000 MHz crystal oscillator." } },
    { upsert: true, new: true }
  );

  // ── Cricket Club — Highly Active (4 days, 3 logs/day) ─────────────────────
  const cricket = seededCultures["cricket-club"];
  const cricketLogs = [
    { user: arjun,  texts: [
      "Called Kohli reaching his 50th Test ton in the third over of the last session. Still can't believe I was right.",
      "Predicting India by 6 wickets in the decider. Pace attack looks unstoppable right now.",
      "Betting on Bumrah taking 4 wickets tomorrow. His length has been unreal this series.",
    ]},
    { user: priya,  texts: [
      "That Dhoni slow walk down the pitch before a big shot — pure matchday-mind in action.",
      "India in the final again. Rohit's captaincy this series has been genuinely impressive.",
      "England's last-over-nerve showed today. Their batters collapsed when it mattered most.",
    ]},
    { user: dev,    texts: [
      "The corridor-of-uncertainty delivery to get Bairstow out was textbook swing bowling.",
      "Last over, 14 needed, and they pulled it off. Greatest last-over-nerve I've watched live.",
      "Shami's reverse swing masterclass today. Three wickets in eight balls. Unreal.",
    ]},
  ];
  for (let i = 0; i < 4; i++) {
    const dayOffset = -i;
    const date = getDateOffset(dayOffset);
    const ritual = await DailyRitual.findOneAndUpdate(
      { cultureId: cricket._id, date },
      {
        $set: {
          title: `Match Moment #${i + 1}`,
          description: "Pick one moment from today or a recent match. In three sentences, explain why you remember it.",
          instructions: [
            "Think of a specific delivery, shot, or fielding moment that stood out.",
            "Describe what happened in the game at that point.",
            "Explain why that moment mattered beyond the scoreboard.",
          ],
          durationMinutes: 10,
          difficulty: "easy",
          reflectionPrompt: "What does this moment tell you about what you love about cricket?",
          reason: "Building community memory around shared match experiences.",
        },
      },
      { upsert: true, new: true }
    );
    for (const log of cricketLogs) {
      await RitualLog.findOneAndUpdate(
        { userId: log.user._id, cultureId: cricket._id, ritualId: ritual._id },
        { $set: { content: log.texts[i % log.texts.length] } },
        { upsert: true, new: true }
      );
    }
  }

  // ── Lo-fi Corner — Active (3 days, 2 logs/day) ────────────────────────────
  const lofi = seededCultures["lofi-corner"];
  const lofiLogs = [
    { user: mia,   texts: [
      "Room-listen session with Idealism's 'Baby'. Noticed the tape hiss underneath the piano. Never caught it before.",
      "Deep-focus-hour from 9 PM. Finished three design tasks. The Knxwledge mix carried the whole session.",
      "Crate-dig into Nujabes tonight. 'Feather' on repeat for two hours. Still perfect.",
    ]},
    { user: priya, texts: [
      "Tried a room-listen with Tomppabeats. That rolling bass is the reason I can't write with lyrics on.",
      "Deep-focus-hour complete. Found a new playlist by ill.Gates and got through half my reading list.",
      "Crate-dig result: City Girl's 'Neon Impasse'. Immediately added to the permanent rotation.",
    ]},
  ];
  for (let i = 0; i < 3; i++) {
    const date = getDateOffset(-i);
    const ritual = await DailyRitual.findOneAndUpdate(
      { cultureId: lofi._id, date },
      {
        $set: {
          title: `Focus Session ${i + 1}`,
          description: "Listen to one lo-fi track without multitasking. Write down one detail you normally miss.",
          instructions: [
            "Choose one track and set it as your only audio source.",
            "Complete one task or sit in stillness for the full duration.",
            "Log the track name and one texture or instrument detail you noticed.",
          ],
          durationMinutes: 15,
          difficulty: "easy",
          reflectionPrompt: "What did the music allow you to do that silence couldn't?",
          reason: "Building intentional listening as a daily anchor for focus.",
        },
      },
      { upsert: true, new: true }
    );
    for (const log of lofiLogs) {
      await RitualLog.findOneAndUpdate(
        { userId: log.user._id, cultureId: lofi._id, ritualId: ritual._id },
        { $set: { content: log.texts[i % log.texts.length] } },
        { upsert: true, new: true }
      );
    }
  }

  // ── DSA & Coding — Highly Active (5 days, 2 logs/day) ────────────────────
  const dsa = seededCultures["dsa-coding"];
  const dsaLogs = [
    { user: dev, texts: [
      "Rubber-duck-log for two-pointer: wrote out my approach, found the off-by-one before touching the keyboard. Pattern-lock moment.",
      "Brute-first on the interval merge problem. Got O(n²), then cleaned to O(n log n). The rewrite taught more than the first pass.",
      "Rubber-duck-log for dynamic programming: restating the overlapping subproblems out loud finally made it click.",
      "Pattern-lock on sliding window today. Solved three variants back to back without looking anything up.",
      "Brute-first on graph BFS, then rewrote with queue. Second version was half the lines.",
    ]},
    { user: arjun, texts: [
      "Brute-force linked list reversal done in 8 minutes. Rewrote iteratively, cut it to 5 lines. Satisfying.",
      "Rubber-duck-log for binary search: realized I was checking mid+1 wrong. Saved 40 minutes of debugging.",
      "Pattern-lock on prefix sums. Finally seeing them everywhere now. LeetCode 560 fell apart in minutes.",
      "Solved longest substring without repeating chars. Sliding window clicked cleanly this time.",
      "Graph DFS stack simulation done. Pattern-lock on DFS/BFS is almost there.",
    ]},
  ];
  for (let i = 0; i < 5; i++) {
    const date = getDateOffset(-i);
    const ritual = await DailyRitual.findOneAndUpdate(
      { cultureId: dsa._id, date },
      {
        $set: {
          title: `Daily Problem ${i + 1}`,
          description: "Solve one problem without hints. Write where you got stuck and how you moved forward.",
          instructions: [
            "Write a rubber-duck-log of your approach before writing any code.",
            "Attempt the brute-first solution without optimising.",
            "Log your final solution and the pattern you used.",
          ],
          durationMinutes: 30,
          difficulty: i < 2 ? "easy" : "medium",
          reflectionPrompt: "What pattern or concept felt closer to pattern-lock after today?",
          reason: "Tracking daily DSA progress builds long-term pattern recognition.",
        },
      },
      { upsert: true, new: true }
    );
    for (const log of dsaLogs) {
      await RitualLog.findOneAndUpdate(
        { userId: log.user._id, cultureId: dsa._id, ritualId: ritual._id },
        { $set: { content: log.texts[i] } },
        { upsert: true, new: true }
      );
    }
  }

  // ── Gaming Lounge — Growing (2 days, 2 logs/day) ──────────────────────────
  const gaming = seededCultures["gaming-lounge"];
  const gamingLogs = [
    { user: sam, texts: [
      "Session-ender last night: final kill in ranked with a crossbow. Put the controller down and just sat there for a minute.",
      "Meta-blind run in Elden Ring — no guides, no wikis. Got destroyed for two hours and it was incredible.",
    ]},
    { user: rio, texts: [
      "Main-character-moment: hit a no-scope across the map in the last circle. Team exploded in chat.",
      "Meta-blind run through an old Zelda game on emulator. Rediscovering what made the puzzles actually good.",
    ]},
  ];
  for (let i = 0; i < 2; i++) {
    const date = getDateOffset(-i);
    const ritual = await DailyRitual.findOneAndUpdate(
      { cultureId: gaming._id, date },
      {
        $set: {
          title: `Session Log ${i + 1}`,
          description: "Describe one gaming moment from today or this week that you wish you could replay.",
          instructions: [
            "Think of a specific moment: a clutch play, a surprise, or a discovery.",
            "Describe what happened in the session leading up to it.",
            "Explain why that moment made the session worth playing.",
          ],
          durationMinutes: 10,
          difficulty: "easy",
          reflectionPrompt: "What made that moment feel like a main-character-moment?",
          reason: "Building shared gaming memory and community story through logs.",
        },
      },
      { upsert: true, new: true }
    );
    for (const log of gamingLogs) {
      await RitualLog.findOneAndUpdate(
        { userId: log.user._id, cultureId: gaming._id, ritualId: ritual._id },
        { $set: { content: log.texts[i] } },
        { upsert: true, new: true }
      );
    }
  }

  // ── Book Club — Active (2 days, 2 logs/day) ───────────────────────────────
  const bookClub = seededCultures["book-club"];
  const bookLogs = [
    { user: elena, texts: [
      "Slow-reading Piranesi. Page 47: 'I had forgotten how beautiful the world was.' I stopped and read it again three times.",
      "Page-gravity is real with Tomorrow and Tomorrow and Tomorrow. Tried to stop at chapter 3. Made it to chapter 6.",
    ]},
    { user: priya, texts: [
      "Spine-creak on a secondhand copy of Stoner by John Williams. The dedication page has handwriting in it. Now I need to know who gave it.",
      "Slow-read mode: 10 pages of Pachinko per day. Keeps every generation's story distinct in my head.",
    ]},
  ];
  for (let i = 0; i < 2; i++) {
    const date = getDateOffset(-i);
    const ritual = await DailyRitual.findOneAndUpdate(
      { cultureId: bookClub._id, date },
      {
        $set: {
          title: `Reading Log ${i + 1}`,
          description: "Share one sentence from your current read that stopped you — no context needed.",
          instructions: [
            "Find the sentence or passage that stayed with you today.",
            "Write it out and share which book it comes from.",
            "Add one sentence about what it made you think or feel.",
          ],
          durationMinutes: 10,
          difficulty: "easy",
          reflectionPrompt: "What did this sentence make you want to read next?",
          reason: "Sharing specific passages builds a real sense of each reader's reading life.",
        },
      },
      { upsert: true, new: true }
    );
    for (const log of bookLogs) {
      await RitualLog.findOneAndUpdate(
        { userId: log.user._id, cultureId: bookClub._id, ritualId: ritual._id },
        { $set: { content: log.texts[i] } },
        { upsert: true, new: true }
      );
    }
  }

  // ── Movie Nights — Active (2 days, 2 logs/day) ────────────────────────────
  const movies = seededCultures["movie-nights"];
  const movieLogs = [
    { user: rio, texts: [
      "Cold-open-hook test passed hard by The Conversation. Five minutes in and I was already leaning forward.",
      "Rewatch-test: Parasite holds up completely. The second viewing reveals how precisely every shot is planned.",
    ]},
    { user: mia, texts: [
      "Watchlist-debt finally cleared: watched Aftersun. Had to sit with it for an hour before I could talk about it.",
      "Rewatch-test on Spirited Away after 10 years. More details, more emotion, different film entirely.",
    ]},
  ];
  for (let i = 0; i < 2; i++) {
    const date = getDateOffset(-i);
    const ritual = await DailyRitual.findOneAndUpdate(
      { cultureId: movies._id, date },
      {
        $set: {
          title: `Film Log ${i + 1}`,
          description: "Describe one scene from a recent film that stayed with you after it ended.",
          instructions: [
            "Pick a specific scene, not the general plot.",
            "Describe what happened in the scene and what made it work.",
            "Say whether it made you want to recommend the film and why.",
          ],
          durationMinutes: 10,
          difficulty: "easy",
          reflectionPrompt: "What does the scene you chose say about what you look for in a film?",
          reason: "Specific scene memory builds richer film discussion than star ratings.",
        },
      },
      { upsert: true, new: true }
    );
    for (const log of movieLogs) {
      await RitualLog.findOneAndUpdate(
        { userId: log.user._id, cultureId: movies._id, ritualId: ritual._id },
        { $set: { content: log.texts[i] } },
        { upsert: true, new: true }
      );
    }
  }

  // ── Photography Walks — Growing (1 day, 2 logs) ────────────────────────────
  const photo = seededCultures["photography-walks"];
  const photoDate = getDateOffset(0);
  const photoRitual = await DailyRitual.findOneAndUpdate(
    { cultureId: photo._id, date: photoDate },
    {
      $set: {
        title: "Walk and Observe",
        description: "Take one photo today of something you walked past before without stopping.",
        instructions: [
          "Go for a short walk with the intention of noticing, not capturing.",
          "When something catches your frame-instinct, stop and take the shot.",
          "Log where you were and what you almost missed.",
        ],
        durationMinutes: 20,
        difficulty: "easy",
        reflectionPrompt: "What made you notice this thing today when you had walked past it before?",
        reason: "Building the habit of active observation before active capture.",
      },
    },
    { upsert: true, new: true }
  );
  for (const entry of [
    { user: priya, content: "Frame-instinct fired at the rust pattern on an old water pipe outside the market. Never looked at that wall before. Shot it twice — once in shade, once in light." },
    { user: kaito, content: "Walk-and-observe mode: spent 15 minutes on one street corner. Decisive-window hit when a cyclist crossed the beam of a shop light. Clean shot." },
  ]) {
    await RitualLog.findOneAndUpdate(
      { userId: entry.user._id, cultureId: photo._id, ritualId: photoRitual._id },
      { $set: { content: entry.content } },
      { upsert: true, new: true }
    );
  }

  // ── Fitness Together — Active (3 days, 2 logs/day) ────────────────────────
  const fitness = seededCultures["fitness-together"];
  const fitnessLogs = [
    { user: arjun, texts: [
      "Minimum-viable-rep day: 15 minutes, bodyweight only. Didn't want to start. Did it anyway. Progress-log complete.",
      "Active-rest: 30 minute walk. Legs were sore from yesterday. This was the right call.",
      "Progress-log: 3 sets of pull-ups, PR on the third. Consistency is doing its thing.",
    ]},
    { user: dev, texts: [
      "Progress-log: skipped the gym but did minimum-viable-rep at home. Kept the streak alive.",
      "Active-rest day. Stretching session. Noticed the stiffness in my left hip finally easing.",
      "Ran 4km. Slowest pace of the month. Still logged it. Minimum-viable-rep for running days.",
    ]},
  ];
  for (let i = 0; i < 3; i++) {
    const date = getDateOffset(-i);
    const ritual = await DailyRitual.findOneAndUpdate(
      { cultureId: fitness._id, date },
      {
        $set: {
          title: `Movement Log ${i + 1}`,
          description: "Log what you did for movement today. Any activity counts — walk, workout, or active-rest.",
          instructions: [
            "Write down what you did — type, duration, and how it felt.",
            "Note if today was a minimum-viable-rep day or a full session.",
            "Set your movement intention for tomorrow.",
          ],
          durationMinutes: 5,
          difficulty: "easy",
          reflectionPrompt: "What helped you show up today even when you didn't want to?",
          reason: "Daily progress-logs build the consistency habit more than motivation ever does.",
        },
      },
      { upsert: true, new: true }
    );
    for (const log of fitnessLogs) {
      await RitualLog.findOneAndUpdate(
        { userId: log.user._id, cultureId: fitness._id, ritualId: ritual._id },
        { $set: { content: log.texts[i] } },
        { upsert: true, new: true }
      );
    }
  }

  // ── Music Discovery — Growing (2 days, 2 logs/day) ────────────────────────
  const musicDisc = seededCultures["music-discovery"];
  const musicLogs = [
    { user: mia, texts: [
      "Sonic-thread led me from Brent Faiyaz to channel Tres. First-listen-feeling: immediately felt like I had missed something obvious.",
      "Deep-cut from a Sampha B-side. Found it chasing a YouTube rabbit hole at 1 AM. That sonic-thread algorithm is relentless.",
    ]},
    { user: rio, texts: [
      "First-listen-feeling on Arooj Aftab: completely still for the entire track. Did not move. Nothing else in my recent memory has done that.",
      "Deep-cut: track 8 on a Terry Riley album from 1969. Been playing it on repeat. Repetition as revelation.",
    ]},
  ];
  for (let i = 0; i < 2; i++) {
    const date = getDateOffset(-i);
    const ritual = await DailyRitual.findOneAndUpdate(
      { cultureId: musicDisc._id, date },
      {
        $set: {
          title: `Discovery Log ${i + 1}`,
          description: "Share one song you discovered this week and describe how you found it.",
          instructions: [
            "Name the artist and track.",
            "Describe your sonic-thread: what you were listening to when you found it.",
            "Write your first-listen-feeling in two sentences.",
          ],
          durationMinutes: 15,
          difficulty: "easy",
          reflectionPrompt: "What does this discovery reveal about where your taste is heading?",
          reason: "Tracking sonic-threads builds a shared discovery map for the community.",
        },
      },
      { upsert: true, new: true }
    );
    for (const log of musicLogs) {
      await RitualLog.findOneAndUpdate(
        { userId: log.user._id, cultureId: musicDisc._id, ritualId: ritual._id },
        { $set: { content: log.texts[i] } },
        { upsert: true, new: true }
      );
    }
  }

  // ── Travel Stories — New (1 day, 1 log) ──────────────────────────────────
  const travel = seededCultures["travel-stories"];
  const travelDate = getDateOffset(0);
  const travelRitual = await DailyRitual.findOneAndUpdate(
    { cultureId: travel._id, date: travelDate },
    {
      $set: {
        title: "Place Memory",
        description: "Share a memory from a place that surprised you — what did you expect, and what did you find instead?",
        instructions: [
          "Pick a specific place: a city, neighbourhood, trail, or room.",
          "Describe what you assumed about it before arriving.",
          "Write one thing it revealed during a local-hour or slow-travel stay.",
        ],
        durationMinutes: 10,
        difficulty: "easy",
        reflectionPrompt: "What did this place teach you that a travel guide could not have told you?",
        reason: "Specific place memories build shared geography for the community.",
      },
    },
    { upsert: true, new: true }
  );
  await RitualLog.findOneAndUpdate(
    { userId: rio._id, cultureId: travel._id, ritualId: travelRitual._id },
    {
      $set: {
        content: "Getting-lost-on-purpose in Oaxaca. Expected a tourist town. Found a local-hour on a Tuesday morning where every stall was closed and three old men were playing chess on a street corner. Stayed for two hours. Slow-travel completely changed what I remember.",
      },
    },
    { upsert: true, new: true }
  );

  console.log("✅ Demo data seeding completed successfully.");
  console.log(`   • 10 demo users (4 original + 6 new)`);
  console.log(`   • 14 communities (4 original creative + 10 accessible)`);
  console.log(`   • QA artifacts removed: ${QA_CULTURE_NAMES.join(", ")}`);
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
