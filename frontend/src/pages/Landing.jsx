import { Link } from "react-router-dom";
import GlowButton from "../components/ui/GlowButton.jsx";
import MicroCultureLogo from "../components/ui/MicroCultureLogo.jsx";

// Mini community preview cards for hero
const HERO_COMMUNITIES = [
  { name: "GATEverse",        symbol: "📚", color: "#F5A623", bg: "#FFF8E7", tag: "Study · Prep" },
  { name: "DSA Dojo",          symbol: "🥋", color: "#818CF8", bg: "#F0F0FF", tag: "Algorithms · Practice" },
  { name: "Pixel Playground",  symbol: "🎨", color: "#C77DFF", bg: "#F8F0FF", tag: "Design · UI/UX" },
  { name: "HackNights",        symbol: "🚀", color: "#FF6B9D", bg: "#FFF0F6", tag: "Build · Ship" },
  { name: "Neural Nest",       symbol: "🧠", color: "#A855F7", bg: "#F9F0FF", tag: "AI · ML" },
  { name: "Java Junction",     symbol: "☕", color: "#E8775A", bg: "#FFF1EC", tag: "Java · Backend" },
];

// How it works steps
const HOW_IT_WORKS = [
  {
    emoji: "🔍",
    color: "#F5A623",
    bg: "#FFF8E7",
    title: "Join a community",
    desc: "Find students who share your goals — GATE prep, DSA, design, AI, hackathons.",
  },
  {
    emoji: "💬",
    color: "#818CF8",
    bg: "#F0F0FF",
    title: "Discuss & do activities",
    desc: "Ask doubts, share resources, and complete 15-minute daily practice prompts.",
  },
  {
    emoji: "🧠",
    color: "#10B981",
    bg: "#ECFDF5",
    title: "AI adapts to your group",
    desc: "Your community's reflections shape future activities — it gets smarter together.",
  },
];

export default function Landing() {
  return (
    <div className="space-y-16 py-6 sm:py-12 animate-fadeIn relative">

      {/* ══════════════════════════════════════════
          HERO SECTION — PLAYFUL & COMMUNITY-FIRST
      ══════════════════════════════════════════ */}
      <div className="relative max-w-4xl mx-auto pt-4 pb-8 sm:py-12 text-center">
        {/* Soft pastel ambient background glows */}
        <div
          className="pointer-events-none absolute -top-10 -left-16 w-72 h-72 rounded-full opacity-40 hidden sm:block"
          style={{ background: "#FFD966", filter: "blur(60px)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-4 -right-16 w-64 h-64 rounded-full opacity-35 hidden sm:block"
          style={{ background: "#C9B6FF", filter: "blur(55px)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/3 w-60 h-60 rounded-full opacity-30 hidden sm:block"
          style={{ background: "#FFB38A", filter: "blur(50px)" }}
          aria-hidden="true"
        />

        {/* Floating playful elements around hero (Desktop & Tablet) */}
        <div className="hidden lg:block pointer-events-none select-none">
          {/* Top Left: GATEverse card */}
          <div
            className="absolute -top-4 -left-12 warm-card px-4 py-2.5 flex items-center gap-2.5 shadow-sm transform -rotate-3 animate-blobFloat"
            style={{ border: "1.5px solid #FFD966" }}
          >
            <span className="text-2xl">📚</span>
            <div className="text-left">
              <div className="text-xs font-extrabold text-[#17172B]">GATEverse</div>
              <div className="text-[10px] text-[#687085]">12.4K students</div>
            </div>
            <span className="text-amber-500 text-xs ml-1">✦</span>
          </div>

          {/* Top Right: Pixel Playground card */}
          <div
            className="absolute top-2 -right-8 warm-card px-4 py-2.5 flex items-center gap-2.5 shadow-sm transform rotate-4"
            style={{ border: "1.5px solid #F58AC6" }}
          >
            <span className="text-2xl">🎨</span>
            <div className="text-left">
              <div className="text-xs font-extrabold text-[#17172B]">Pixel Playground</div>
              <div className="text-[10px] text-[#687085]">Daily UI design</div>
            </div>
            <span className="text-pink-400 text-xs ml-1">✦</span>
          </div>

          {/* Bottom Left: Java Junction card */}
          <div
            className="absolute -bottom-4 -left-8 warm-card px-4 py-2.5 flex items-center gap-2.5 shadow-sm transform rotate-2"
            style={{ border: "1.5px solid #FFB38A" }}
          >
            <span className="text-2xl">☕</span>
            <div className="text-left">
              <div className="text-xs font-extrabold text-[#17172B]">Java Junction</div>
              <div className="text-[10px] text-[#687085]">2.4K members</div>
            </div>
          </div>

          {/* Bottom Right: DSA Dojo activity pill */}
          <div
            className="absolute -bottom-6 -right-6 warm-card px-4 py-2.5 flex items-center gap-2.5 shadow-sm transform -rotate-2"
            style={{ border: "1.5px solid #C9B6FF" }}
          >
            <span className="text-xl">🥋</span>
            <div className="text-left">
              <div className="text-xs font-extrabold text-[#17172B]">DSA Dojo</div>
              <div className="text-[10px] text-violet-600 font-semibold">⚡ Today: Graphs</div>
            </div>
          </div>
        </div>

        {/* Small sparkling star */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold mb-4 shadow-xs"
          style={{ background: "#FFF8ED", border: "1.5px solid #FFD966", color: "#B45309" }}
        >
          <span>✦</span>
          <span>Student social community app</span>
          <span>✦</span>
        </div>

        {/* Hero headline with large friendly typography */}
        <div className="space-y-4 relative z-10 max-w-3xl mx-auto">
          <h1
            className="text-4xl sm:text-6xl lg:text-[62px] font-extrabold leading-[1.1] tracking-tight"
            style={{ color: "#17172B" }}
          >
            Create communities around the things you care about.
          </h1>
          <p
            className="text-base sm:text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: "#687085" }}
          >
            Learn, build, discuss and grow with people who are into the same things.
            Powered by daily practice challenges and collective memory.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-6 relative z-10">
          <Link to="/explore" className="w-full sm:w-auto">
            <button
              className="w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-extrabold text-white transition-all duration-200 hover:opacity-95 active:scale-98 shadow-md flex items-center justify-center gap-2"
              style={{ background: "#17172B" }}
            >
              <span>Explore communities</span>
              <span>→</span>
            </button>
          </Link>
          <Link to="/create" className="w-full sm:w-auto">
            <button
              className="w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-extrabold text-[#17172B] bg-white transition-all duration-200 hover:bg-neutral-50 active:scale-98 shadow-xs flex items-center justify-center gap-2"
              style={{ border: "1.5px solid rgba(23,23,43,0.12)" }}
            >
              <span>+ Start a community</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          COMMUNITY CARD PREVIEW GRID
      ══════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-extrabold" style={{ color: "#17172B" }}>
            Popular student communities
          </h2>
          <p className="text-xs sm:text-sm font-medium mt-0.5" style={{ color: "#687085" }}>
            Clubs for learners, builders, and curious minds
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {HERO_COMMUNITIES.map((c) => (
            <Link
              key={c.name}
              to="/explore"
              className="group warm-card p-4 flex flex-col gap-2.5 hover:scale-[1.02] transition-transform duration-200"
            >
              {/* Icon zone */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-xs"
                style={{ background: c.bg, border: `2px solid ${c.color}35` }}
              >
                {c.symbol}
              </div>
              <div>
                <div className="text-sm font-extrabold" style={{ color: "#17172B" }}>
                  {c.name}
                </div>
                <div className="text-[11px] font-medium mt-0.5" style={{ color: "#687085" }}>
                  {c.tag}
                </div>
              </div>
              <div
                className="mt-auto text-xs font-bold flex items-center gap-1"
                style={{ color: "#17172B" }}
              >
                <span>Join</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h2
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            style={{ color: "#1A1A2E" }}
          >
            How your community grows
          </h2>
          <p className="text-sm" style={{ color: "#64748B" }}>
            Three simple things, every day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={step.title}
              className="warm-card p-5 space-y-3"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: step.bg, border: `2px solid ${step.color}30` }}
              >
                {step.emoji}
              </div>
              <div>
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: step.color }}
                >
                  Step {i + 1}
                </div>
                <h3
                  className="text-base font-extrabold mb-1"
                  style={{ color: "#1A1A2E" }}
                >
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          DEMO COMMUNITY CARD
      ══════════════════════════════════════════ */}
      <div className="max-w-2xl mx-auto">
        <div
          className="warm-card p-6 sm:p-8 relative overflow-hidden"
          style={{ border: "1.5px solid #F5A62340" }}
        >
          {/* Decorative blob */}
          <div
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "#FDE68A", filter: "blur(40px)", opacity: 0.5 }}
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: "#FFF8E7", border: "2px solid #F5A62340" }}
                >
                  📚
                </div>
                <div>
                  <h3
                    className="text-xl font-extrabold leading-tight"
                    style={{ color: "#1A1A2E" }}
                  >
                    GATEverse
                  </h3>
                  <p className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                    14 members · 28 discussions this week
                  </p>
                </div>
              </div>
              <Link to="/explore">
                <GlowButton size="sm" variant="secondary">
                  Preview →
                </GlowButton>
              </Link>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>
              GATE prep, engineering maths discussions, formula reviews, and daily study consistency for aspirants.
            </p>

            {/* Today's activity */}
            <div
              className="p-4 rounded-2xl"
              style={{ background: "#FFF8E7", border: "1.5px solid #F5A62335" }}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold" style={{ color: "#F5A623" }}>
                  ⚡ Today's activity
                </span>
                <span style={{ color: "#94A3B8" }}>15 min</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#374151" }}>
                Solve 3 previous year questions on Linear Algebra matrices, verify your eigenvalues, and log your doubt or takeaway.
              </p>
            </div>

            {/* Live discussion snippet */}
            <div
              className="p-3.5 rounded-2xl flex items-center gap-2.5"
              style={{ background: "rgba(26,26,46,0.03)", border: "1.5px solid rgba(26,26,46,0.07)" }}
            >
              <span className="text-lg">💬</span>
              <span className="text-xs italic flex-1" style={{ color: "#4B5563" }}>
                "How are you preparing Engineering Maths? Linear Algebra is taking longer than expected."
              </span>
              <span className="text-[11px] shrink-0 font-medium" style={{ color: "#94A3B8" }}>— Priya</span>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between pt-2"
              style={{ borderTop: "1.5px solid rgba(26,26,46,0.07)" }}
            >
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "#10B981" }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Community memory active
              </div>
              <Link
                to="/explore"
                className="text-sm font-bold transition-colors"
                style={{ color: "#1A1A2E" }}
              >
                Join now →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
