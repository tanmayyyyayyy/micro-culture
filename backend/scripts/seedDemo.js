import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Culture from "../models/Culture.js";
import DailyRitual from "../models/DailyRitual.js";
import RitualLog from "../models/RitualLog.js";
import { OLD_SHOWCASE_NAMES } from "./cleanDemo.js";

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

  console.log("🌱 Starting Micro Culture playful student-community seeding...");

  // ---------------------------------------------------------------------------
  // STEP 0: Clean out old showcase communities safely (preserving real users)
  // ---------------------------------------------------------------------------
  const oldCultures = await Culture.find({ name: { $in: OLD_SHOWCASE_NAMES } }).lean();
  if (oldCultures.length > 0) {
    const oldCultureIds = oldCultures.map((c) => c._id);
    await RitualLog.deleteMany({ cultureId: { $in: oldCultureIds } });
    await DailyRitual.deleteMany({ cultureId: { $in: oldCultureIds } });
    await Culture.deleteMany({ _id: { $in: oldCultureIds } });
    console.log(`🧹 Removed ${oldCultures.length} old showcase community(ies).`);
  }

  // ---------------------------------------------------------------------------
  // STEP 1: Seed Demo Users (deterministic by email — upserted, never duplicated)
  // ---------------------------------------------------------------------------
  const defaultPasswordHash = await bcrypt.hash("demo123456", 10);
  const demoUserData = [
    { name: "Arjun Mehta",    email: "demo.arjun@microculture.local" },
    { name: "Priya Sharma",   email: "demo.priya@microculture.local" },
    { name: "Dev Patel",      email: "demo.dev@microculture.local" },
    { name: "Ananya Rao",     email: "demo.ananya@microculture.local" },
    { name: "Rohan Iyer",     email: "demo.rohan@microculture.local" },
    { name: "Sneha Gupta",    email: "demo.sneha@microculture.local" },
    { name: "Kabir Verma",    email: "demo.kabir@microculture.local" },
    { name: "Tanvi Joshi",    email: "demo.tanvi@microculture.local" },
    { name: "Aditya Singh",   email: "demo.aditya@microculture.local" },
    { name: "Meera Nair",     email: "demo.meera@microculture.local" },
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

  const [arjun, priya, dev, ananya, rohan, sneha, kabir, tanvi, aditya, meera] = users;

  // ---------------------------------------------------------------------------
  // STEP 2: Seed 14 Student-Focused Communities
  // ---------------------------------------------------------------------------
  const communityDefs = [
    {
      key: "gateverse",
      name: "GATEverse",
      description: "GATE preparation, discussions, resources, PYQs, engineering mathematics, and daily study consistency for aspirants.",
      vibeWords: ["study", "gate", "pyqs", "prep", "engineering"],
      aesthetic: ["yellow accent", "engineering graph", "clean notes", "formula sheet"],
      values: ["consistency over cramming", "concept clarity first", "lifting peers with doubts"],
      jargon: [
        "PYQ-sprint: solving previous 10 years questions in one focused block",
        "virtual-calci: mastering speed tricks on the official exam calculator",
        "rank-builder: targeting high-yield aptitude and engineering mathematics marks",
      ],
      rituals: [
        "Solve 3 previous year questions on your weakest subject today and note your mistakes",
        "Review 2 engineering mathematics formulas and derive them from first principles",
        "Log your daily study check-in: subjects covered, hours focused, and doubts resolved",
      ],
      symbol: "📚",
      color: "#f59e0b",
      creator: arjun,
      members: [arjun, priya, dev, ananya, rohan, sneha, kabir],
      discussions: [
        { user: priya, content: "How are you preparing Engineering Maths? Linear Algebra matrices and eigenvalues took me 3 days but feeling confident now!" },
        { user: dev, content: "Best resources for GATE 2027? Looking for standard textbook recommendations vs Made Easy/Ace notes." },
        { user: arjun, content: "Daily study check-in: 4 hours of Digital Logic and K-maps done today. Anyone wants to review sequential circuits tonight?" },
        { user: rohan, content: "Fluid Mechanics doubt: Question 34 from 2022 paper — can someone verify the boundary condition on the boundary layer thickness?" },
      ],
      activityLevel: "highly_active",
    },
    {
      key: "java-junction",
      name: "Java Junction",
      description: "Java learning, coding practice, OOP mastery, DSA implementations, Spring backend projects, and interview questions.",
      vibeWords: ["code", "java", "oop", "backend", "spring"],
      aesthetic: ["warm amber", "clean syntax", "terminal output", "enterprise craft"],
      values: ["clean architecture", "deep JVM understanding", "writing readable enterprise code"],
      jargon: [
        "gc-tuning: understanding garbage collector behavior under high memory load",
        "stream-pipeline: expressive zero-mutation data transformation",
        "byte-dance: inspecting compiled bytecode to understand compiler optimizations",
      ],
      rituals: [
        "Write a small snippet demonstrating polymorphic dispatch and explain how JVM resolves it",
        "Benchmark an ArrayList versus a LinkedList for 100k random insertions and observe timings",
        "Refactor an old nested loop into clean Java Streams with proper exception handling",
      ],
      symbol: "☕",
      color: "#ea580c",
      creator: dev,
      members: [dev, arjun, priya, rohan, kabir, aditya],
      discussions: [
        { user: dev, content: "Why is String immutable in Java? Here is a breakdown of security, string pool caching, and thread safety in multithreaded apps." },
        { user: priya, content: "Best way to learn Collections? Should I implement HashMap from scratch to understand hash buckets and collision resolution?" },
        { user: aditya, content: "Java project ideas: building a lightweight Redis clone in pure Core Java using NIO non-blocking sockets." },
        { user: kabir, content: "OOP interview questions: what is the actual difference between composition and aggregation in real-world software?" },
      ],
      activityLevel: "highly_active",
    },
    {
      key: "pixel-playground",
      name: "Pixel Playground",
      description: "UI/UX design, Figma tricks, design systems, portfolio critiques, micro-interactions, and friendly design discussions.",
      vibeWords: ["design", "ui", "ux", "figma", "portfolio"],
      aesthetic: ["pastel pink", "glass cards", "fluid gradients", "clean typography"],
      values: ["empathy for the user", "atomic consistency", "feedback without ego"],
      jargon: [
        "auto-layout-sorcery: crafting responsive Figma components that gracefully resize",
        "micro-copy: crafting 3-word labels that make confusing flows intuitive",
        "design-token: unifying spacing, typography, and color variables across design & code",
      ],
      rituals: [
        "Pick one confusing mobile app screen and sketch an improved visual hierarchy",
        "Audit the contrast ratio of 3 buttons in your current portfolio against WCAG standards",
        "Create an interactive auto-layout component in Figma with at least 3 distinct states",
      ],
      symbol: "🎨",
      color: "#ec4899",
      creator: ananya,
      members: [ananya, sneha, tanvi, priya, meera],
      discussions: [
        { user: ananya, content: "Feedback on my portfolio: redesigned my case study for a campus event discovery app, would love your honest critiques on typography and spacing!" },
        { user: sneha, content: "Best Figma plugins you use daily? Styler, Content Reel, and Contrast Checker are my non-negotiables." },
        { user: tanvi, content: "How do you build a design system from scratch? When is the right moment to tokenize spacing vs hardcoded values?" },
        { user: meera, content: "UI inspiration thread: drop your favorite playful student and portfolio websites of 2026." },
      ],
      activityLevel: "active",
    },
    {
      key: "blockbuilders",
      name: "BlockBuilders",
      description: "Blockchain, Web3, smart contracts, Solidity security, decentralized apps, and crypto engineering fundamentals.",
      vibeWords: ["code", "build", "blockchain", "web3", "solidity"],
      aesthetic: ["electric blue", "crypto blocks", "smart contract code", "decentralized web"],
      values: ["code is law", "security-first mindset", "decentralized empowerment"],
      jargon: [
        "gas-golf: shaving every single unit of gas from contract execution",
        "reentrancy-guard: protecting contract state before external token transfers",
        "zero-knowledge: proving validity without leaking underlying data",
      ],
      rituals: [
        "Audit a 20-line smart contract snippet for reentrancy vulnerabilities",
        "Deploy a simple ERC-20 or ERC-721 token contract on a local Hardhat node",
        "Explain in 3 sentences how optimistic rollups differ from ZK rollups",
      ],
      symbol: "⛓️",
      color: "#3b82f6",
      creator: kabir,
      members: [kabir, dev, arjun, rohan],
      discussions: [
        { user: kabir, content: "Foundry vs Hardhat in 2026: writing smart contract tests in pure Solidity transformed our dev and deployment cycle." },
        { user: dev, content: "Common smart contract vulnerabilities every beginner misses in their first security audit — beware of unchecked math and delegatecalls." },
        { user: rohan, content: "Building an on-chain student credential verification system for hackathons: here is our architectural diagram." },
      ],
      activityLevel: "growing",
    },
    {
      key: "cyber-sentinels",
      name: "Cyber Sentinels",
      description: "Cybersecurity, ethical hacking, CTF walkthroughs, network defense, Linux hardening, and security learning.",
      vibeWords: ["security", "cyber", "ctf", "ethical-hacking", "networking"],
      aesthetic: ["mint teal", "matrix terminal", "hex dump", "cryptography"],
      values: ["defense in depth", "responsible disclosure", "curiosity guided by ethics"],
      jargon: [
        "flag-capture: solving a cryptographic or binary exploitation challenge",
        "packet-inspection: analyzing Wireshark pcap files for suspicious TCP handshakes",
        "priv-esc: systematically traversing Linux capabilities to gain root access",
      ],
      rituals: [
        "Analyze a sample HTTP request header and identify potential injection vectors",
        "Write a one-line regex or rule to detect unauthorized SSH brute-force attempts",
        "Solve one beginner crypto challenge on Cryptohack and document your methodology",
      ],
      symbol: "🛡️",
      color: "#14b8a6",
      creator: rohan,
      members: [rohan, kabir, aditya, dev, sneha],
      discussions: [
        { user: rohan, content: "Starting CTFs as a beginner: PicoCTF vs TryHackMe roadmap. Here is the path I followed to score top 50 in our national college round." },
        { user: kabir, content: "Walkthrough of yesterday's web exploitation challenge: exploiting blind SQL injection via a nested JSON payload." },
        { user: aditya, content: "How to set up a safe, isolated home lab with Kali Linux and vulnerable target VMs on VirtualBox." },
      ],
      activityLevel: "active",
    },
    {
      key: "hacknights",
      name: "HackNights",
      description: "Hackathons, team matchmaking, brainstorming ideas, rapid MVP building, pitching tips, and hackathon wins.",
      vibeWords: ["build", "hackathon", "team", "mvp", "pitch"],
      aesthetic: ["coral pink", "late night coffee", "rapid prototype", "demo day"],
      values: ["ship over polish", "radical collaboration", "solving real pain points"],
      jargon: [
        "pitch-hook: the 15-second opening sentence that captures hackathon judges",
        "mvp-trim: cutting 80% of proposed features to ship a working demo in 24 hours",
        "demo-gods: making sure the live deployment works flawlessly during final judging",
      ],
      rituals: [
        "Pitch a 2-sentence solution for a campus problem you experienced this week",
        "Sketch the 3 essential screens required for a 24-hour hackathon MVP",
        "Review a teammate's pull request with constructive, encouraging feedback",
      ],
      symbol: "🚀",
      color: "#f43f5e",
      creator: sneha,
      members: [sneha, ananya, arjun, dev, tanvi, meera, aditya],
      discussions: [
        { user: sneha, content: "Looking for 1 frontend dev (React/Tailwind) and 1 UI designer for Smart India Hackathon! We are building an agri-tech marketplace." },
        { user: ananya, content: "How our team won 1st place at HackVerse 2026: 5 lessons in timeboxing, pitch slide design, and cutting dead code." },
        { user: dev, content: "Best boilerplates for 24-hour hackathons: Next.js + Tailwind + Supabase vs Vite + Fastify + SQLite." },
      ],
      activityLevel: "highly_active",
    },
    {
      key: "dsa-dojo",
      name: "DSA Dojo",
      description: "Data structures, algorithmic patterns, LeetCode problem solving, and FAANG interview preparation.",
      vibeWords: ["code", "study", "dsa", "leetcode", "algorithms"],
      aesthetic: ["lavender blue", "binary tree", "recursion depth", "clean math"],
      values: ["pattern recognition over memorization", "daily consistency", "clean complexity analysis"],
      jargon: [
        "sliding-window: bounding subsegment analysis in O(N) instead of O(N²)",
        "two-pointer: converging pointers to eliminate redundant passes",
        "monotonic-stack: maintaining sorted order to find next greater element in O(1) amortized",
      ],
      rituals: [
        "Solve today's medium LeetCode problem using the two-pointer or sliding-window pattern",
        "Write down the time and space complexity of your solution and justify both",
        "Explain a binary search variation to a peer in plain English without looking at code",
      ],
      symbol: "🥋",
      color: "#818cf8",
      creator: arjun,
      members: [arjun, dev, priya, rohan, kabir, aditya, tanvi],
      discussions: [
        { user: arjun, content: "Struggling with Dynamic Programming? Here is how to transition step-by-step from brute-force recursion to memoization and tabulation." },
        { user: priya, content: "NeetCode 150 vs Striver A2Z DSA Sheet: which one should college students follow for 6-month placement prep?" },
        { user: dev, content: "Daily LeetCode check-in: today's problem was Trapping Rain Water — two-pointer approach vs monotonic stack comparison." },
      ],
      activityLevel: "highly_active",
    },
    {
      key: "codecanvas",
      name: "CodeCanvas",
      description: "Web development, React, modern JavaScript, full-stack architectures, API design, and frontend craft.",
      vibeWords: ["code", "build", "webdev", "react", "fullstack"],
      aesthetic: ["orange glow", "component tree", "responsive layout", "modern web"],
      values: ["accessible by default", "smooth 60fps UX", "pragmatic engineering"],
      jargon: [
        "hydration-mismatch: when server HTML and client React reconciliation diverge",
        "state-lift: moving state to the nearest common ancestor with clean props",
        "bundle-diet: trimming heavy dependencies with tree-shaking and dynamic imports",
      ],
      rituals: [
        "Build a small accessible modal with keyboard focus trapping and escape key handling",
        "Refactor an existing component to remove unnecessary re-renders using React DevTools",
        "Audit a web page with Lighthouse and fix at least one performance or accessibility bottleneck",
      ],
      symbol: "💻",
      color: "#f97316",
      creator: dev,
      members: [dev, ananya, sneha, aditya, tanvi],
      discussions: [
        { user: dev, content: "React 19 Server Actions vs traditional REST APIs: when should students use which for college portfolio apps?" },
        { user: ananya, content: "How I built a full-stack real-time collaboration canvas using WebSockets, React, and Node.js." },
        { user: tanvi, content: "State management in 2026: Zustand vs TanStack Query — do we still need Redux for modern student apps?" },
      ],
      activityLevel: "active",
    },
    {
      key: "neural-nest",
      name: "Neural Nest",
      description: "Artificial intelligence, machine learning, LLM agents, GenAI architectures, and practical hands-on ML projects.",
      vibeWords: ["ai", "ml", "genai", "llm", "neural"],
      aesthetic: ["deep purple", "neural network", "attention heatmap", "vector space"],
      values: ["understanding the math", "practical applications", "ethical AI development"],
      jargon: [
        "context-window: the maximum token budget an attention layer can process concurrently",
        "lora-adapter: parameter-efficient fine-tuning without updating full model weights",
        "rag-pipeline: augmenting generative models with verified semantic retrieval",
      ],
      rituals: [
        "Explain how multi-head self-attention computes query, key, and value matrices in 3 sentences",
        "Run a small text classification or embeddings model on your local machine using PyTorch",
        "Experiment with temperature and top-p sampling on an LLM prompt and note variance",
      ],
      symbol: "🧠",
      color: "#8b5cf6",
      creator: aditya,
      members: [aditya, arjun, priya, kabir, meera],
      discussions: [
        { user: aditya, content: "How to build an end-to-end RAG pipeline from scratch with ChromaDB, LangChain, and open-source embedding models." },
        { user: priya, content: "Linear Algebra & Calculus for Machine Learning: the essential math roadmap for second-year computer science students." },
        { user: kabir, content: "Fine-tuning Llama 3 on a single Google Colab GPU using LoRA and Unsloth — complete reproducible notebook." },
      ],
      activityLevel: "highly_active",
    },
    {
      key: "open-source-orbit",
      name: "Open Source Orbit",
      description: "GitHub, open source contributions, GSoC preparation, pull request etiquette, and global student collaboration.",
      vibeWords: ["code", "build", "opensource", "github", "gsoc"],
      aesthetic: ["emerald green", "git graph", "clean markdown", "community pull request"],
      values: ["public learning", "respectful code reviews", "documentation as a craft"],
      jargon: [
        "good-first-issue: curated repo entry points for first-time contributors",
        "squash-rebase: tidying up commit history into a single clean atomic commit",
        "maintainer-etiquette: drafting respectful PR descriptions with reproduction steps",
      ],
      rituals: [
        "Find 2 active open-source repos with 'good first issue' labels in languages you know",
        "Write or improve documentation for an open-source tool you use regularly",
        "Review an open pull request in a public repository and learn how maintainers provide feedback",
      ],
      symbol: "🌐",
      color: "#10b981",
      creator: meera,
      members: [meera, arjun, dev, sneha, ananya],
      discussions: [
        { user: meera, content: "My journey to getting selected for Google Summer of Code (GSoC): proposal writing tips and contribution timeline." },
        { user: arjun, content: "How to find beginner-friendly open-source repositories without getting overwhelmed by 50k-line codebases." },
        { user: dev, content: "First Pull Request celebration thread: share your merged PRs and what you learned from maintainer feedback!" },
      ],
      activityLevel: "active",
    },
    {
      key: "codesprint",
      name: "CodeSprint",
      description: "Competitive programming, Codeforces contests, AtCoder, speed coding, and mathematical intuition.",
      vibeWords: ["code", "study", "cp", "contests", "codeforces"],
      aesthetic: ["fiery red", "contest timer", "codeforces rank", "fast io"],
      values: ["speed through precision", "unrelenting grit", "learning from every rating drop"],
      jargon: [
        "tle-avoidance: optimizing algorithm constants to fit in 1.0s time limit",
        "upsolving: rigorously solving contest problems you failed during the live round",
        "cf-rating: the emotional rollercoaster of Codeforces color changes",
      ],
      rituals: [
        "Upsolve 1 problem from the last Codeforces or AtCoder contest that you couldn't solve in-round",
        "Implement modular arithmetic and fast exponentiation in under 3 minutes",
        "Analyze why a greedy approach failed on a past problem and why DP or flow was needed",
      ],
      symbol: "⚡",
      color: "#ef4444",
      creator: kabir,
      members: [kabir, arjun, dev, rohan],
      discussions: [
        { user: kabir, content: "Codeforces Round 990 editorial & discussion: how did you solve Problem C? Here is my O(N log N) greedy sorting approach." },
        { user: arjun, content: "How to transition from Specialist (1400) to Candidate Master (1900): practice routine and virtual contest strategy." },
        { user: rohan, content: "Number theory fundamentals: sieve of Eratosthenes, GCD, and modular inverse explained with C++ snippets." },
      ],
      activityLevel: "growing",
    },
    {
      key: "career-launchpad",
      name: "Career Launchpad",
      description: "Campus placements, resume reviews, technical mock interviews, internships, and career strategy for students.",
      vibeWords: ["career", "placements", "interviews", "resumes", "internships"],
      aesthetic: ["soft purple", "polished resume", "offer letter", "interview prep"],
      values: ["preparation beats anxiety", "lifting each other up", "authentic representation"],
      jargon: [
        "ats-score: formatting resumes so automated campus scanners don't discard your hard work",
        "star-method: structuring behavioral interview answers (Situation, Task, Action, Result)",
        "system-design-lite: answering high-level scalability questions for college new-grad roles",
      ],
      rituals: [
        "Refine one bullet point on your resume using action verbs and quantifiable metrics",
        "Record yourself answering 'Tell me about a challenging technical bug you resolved' in 90 seconds",
        "Research 2 companies hiring college graduates and identify their primary tech stacks",
      ],
      symbol: "🎯",
      color: "#c084fc",
      creator: tanvi,
      members: [tanvi, priya, sneha, ananya, arjun, dev, meera],
      discussions: [
        { user: tanvi, content: "Resume review megathread: drop your PDF link and get constructive student feedback on structure and bullet points!" },
        { user: priya, content: "How I cracked my software engineering internship at a top product company: 6-month preparation timeline." },
        { user: sneha, content: "Behavioral interviews: the 5 questions every student should prepare using the STAR method before placement season." },
      ],
      activityLevel: "highly_active",
    },
    {
      key: "devops-dock",
      name: "DevOps Dock",
      description: "Docker, Kubernetes, CI/CD pipelines, Linux servers, cloud hosting, and production infrastructure.",
      vibeWords: ["build", "code", "devops", "docker", "cloud"],
      aesthetic: ["cyan navy", "docker container", "pipeline green", "cloud terminal"],
      values: ["automate everything", "observable systems", "infrastructure as code"],
      jargon: [
        "multi-stage-build: shrinking Docker image sizes from 1GB to 30MB with clean artifacts",
        "pipeline-fail: diagnosing broken GitHub Actions workflow YAMLs",
        "reverse-proxy: routing incoming traffic safely through NGINX to internal microservices",
      ],
      rituals: [
        "Write a multi-stage Dockerfile for a Node.js or Python app and inspect its layer sizes",
        "Set up a simple GitHub Actions CI workflow that runs linter and unit tests on push",
        "Configure a local NGINX reverse proxy to route two microservices on different ports",
      ],
      symbol: "🐳",
      color: "#06b6d4",
      creator: rohan,
      members: [rohan, dev, kabir, aditya],
      discussions: [
        { user: rohan, content: "Dockerizing a React + Node + MongoDB full-stack application with Docker Compose: template with hot reload." },
        { user: dev, content: "Free cloud tiers for student projects: AWS Free Tier vs Render vs Oracle Cloud Always Free comparison." },
        { user: aditya, content: "Understanding Kubernetes in plain English: Pods, Services, and Ingress explained with simple diagrams." },
      ],
      activityLevel: "growing",
    },
    {
      key: "project-playground",
      name: "Project Playground",
      description: "Students sharing projects, finding teammates, getting feedback, and building cool things in public.",
      vibeWords: ["build", "design", "projects", "feedback", "showcase"],
      aesthetic: ["warm gold", "demo video", "user feedback", "building in public"],
      values: ["build in public", "constructive critiques", "celebrating small wins"],
      jargon: [
        "ship-sunday: committing to deploy whatever state your project is in every week",
        "peer-roast: a kind but razor-sharp critique of UX flow and edge cases",
        "collab-ping: broadcasting project ideas to find complementary student skills",
      ],
      rituals: [
        "Share a screenshot or 30-second screen recording of your current project progress",
        "Try out a peer's shared project link and leave 2 specific things you liked and 1 suggestion",
        "Write down the next single feature you are going to code and set a 45-minute timer",
      ],
      symbol: "🛠️",
      color: "#eab308",
      creator: sneha,
      members: [sneha, ananya, tanvi, meera, dev, arjun],
      discussions: [
        { user: sneha, content: "Showcase: I built an AI study schedule generator for university exams — check out the live link and let me know your thoughts!" },
        { user: ananya, content: "Looking for a backend developer to collaborate on an open-source campus event tracker with real-time RSVPs." },
        { user: meera, content: "How do you stay motivated to finish personal side projects when university classes and exams get busy?" },
      ],
      activityLevel: "active",
    },
  ];

  const seededCultures = {};

  for (const def of communityDefs) {
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
          isPublished: true,
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
  // STEP 3: Seed DailyRituals & Discussions (RitualLogs) for All 14 Communities
  // ---------------------------------------------------------------------------
  for (const def of communityDefs) {
    const cult = seededCultures[def.key];

    // Seed 4 days of rituals
    for (const dayOffset of [0, -1, -2, -3]) {
      const date = getDateOffset(dayOffset);
      const ritualTitle = `${def.rituals[Math.abs(dayOffset) % def.rituals.length]}`;
      const ritual = await DailyRitual.findOneAndUpdate(
        { cultureId: cult._id, date },
        {
          $set: {
            title: ritualTitle,
            description: `Today's community practice for ${def.name}. Take part, build your streak, and share your reflection.`,
            instructions: [
              "Review the prompt and set aside 10-15 minutes.",
              "Complete the practical task or problem.",
              "Post a brief reflection or question below.",
            ],
            durationMinutes: 15,
            difficulty: "easy",
            reflectionPrompt: `What did you discover or learn while doing this ${def.name} activity?`,
            reason: `Building daily momentum and peer collaboration in ${def.name}.`,
          },
        },
        { upsert: true, new: true }
      );

      // Seed 2-3 logs for today's and recent rituals
      const participants = def.members.slice(0, 3);
      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        const discussionSnippet =
          def.discussions[i % def.discussions.length]?.content ||
          `Completed today's ${def.name} activity! Learned a lot and looking forward to tomorrow.`;

        await RitualLog.findOneAndUpdate(
          { userId: p._id, cultureId: cult._id, ritualId: ritual._id },
          { $set: { content: discussionSnippet } },
          { upsert: true, new: true }
        );
      }
    }

    // Also seed general community discussions into logs
    for (const d of def.discussions) {
      await RitualLog.findOneAndUpdate(
        { userId: d.user._id, cultureId: cult._id, content: d.content },
        { $set: { content: d.content } },
        { upsert: true, new: true }
      );
    }
  }

  console.log(`✅ Seeded ${communityDefs.length} student-focused communities successfully!`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runDemoSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Demo seed failed:", err.message);
      process.exit(1);
    });
}
