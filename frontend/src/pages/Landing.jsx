import { Link } from "react-router-dom";
import GlowButton from "../components/ui/GlowButton.jsx";
import GlassPanel from "../components/ui/GlassPanel.jsx";
import MicroCultureLogo from "../components/ui/MicroCultureLogo.jsx";

export default function Landing() {
  return (
    <div className="space-y-12 sm:space-y-16 py-6 sm:py-10 animate-fadeIn">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-5">
        <div className="flex justify-center mb-1">
          <MicroCultureLogo size="2xl" showWordmark={false} />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
          <span>🎒</span> Student Communities + Daily Learning + AI Memory
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Create communities around the{" "}
          <span className="text-gradient-purple">things you care about</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-neutral-300 max-w-xl mx-auto leading-relaxed">
          Join a club, discuss doubts, take part in daily activities, and let AI help your community grow.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-1 w-full max-w-sm sm:max-w-none mx-auto">
          <Link to="/explore" className="w-full sm:w-auto">
            <GlowButton variant="glow" size="lg" className="w-full sm:w-auto justify-center min-h-[48px]">
              Find Your People →
            </GlowButton>
          </Link>
          <Link to="/create" className="w-full sm:w-auto">
            <GlowButton variant="secondary" size="lg" className="w-full sm:w-auto justify-center min-h-[48px]">
              + Start a Club
            </GlowButton>
          </Link>
        </div>

        {/* 3-Step Overview: How it works */}
        <div className="pt-3 max-w-2xl mx-auto space-y-2">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            How it works
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left space-y-1">
              <div className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                <span>1.</span> Join a Community
              </div>
              <p className="text-xs text-neutral-400 leading-snug">
                Find students sharing your goals: GATE, Java, UI/UX, DSA, hackathons.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left space-y-1">
              <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <span>2.</span> Discuss &amp; Do Activities
              </div>
              <p className="text-xs text-neutral-400 leading-snug">
                Ask doubts, exchange resources, and complete 15-minute daily practice prompts.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left space-y-1">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>3.</span> AI Learns &amp; Adapts
              </div>
              <p className="text-xs text-neutral-400 leading-snug">
                Your group&apos;s reflections shape what activities and resources appear next.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Demo Card — Playful Student Club Preview */}
      <div className="max-w-2xl mx-auto">
        <div className="playful-card p-6 sm:p-8 relative overflow-hidden border border-amber-500/25 shadow-2xl">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 bg-amber-500" />

          {/* Identity Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-sm">
                📚
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-white text-lg">
                    GATEverse
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Active Club
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  14 members · 28 discussions this week
                </p>
              </div>
            </div>
            <Link to="/explore" className="self-start sm:self-auto">
              <GlowButton size="sm" variant="secondary" className="min-h-[38px]">
                Preview Club →
              </GlowButton>
            </Link>
          </div>

          <p className="text-sm text-neutral-200 leading-relaxed mb-4 relative z-10">
            GATE preparation, engineering mathematics discussions, formula review, and daily study consistency for aspirants.
          </p>

          {/* Today's Activity Teaser */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2 mb-4 relative z-10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                <span>⚡</span> Today&apos;s Activity: Engineering Maths Sprint
              </span>
              <span className="text-neutral-400 font-mono text-[11px]">15 min · Easy</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Solve 3 previous year questions on Linear Algebra matrices, verify your eigenvalues, and log your doubt or takeaway.
            </p>
          </div>

          {/* Live Discussion Snippet */}
          <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-white/5 text-xs text-neutral-300 flex items-center gap-2 mb-4 relative z-10">
            <span className="text-base">💬</span>
            <span className="italic text-neutral-300">
              &ldquo;How are you preparing Engineering Maths? Linear Algebra is taking longer than expected.&rdquo;
            </span>
            <span className="text-neutral-500 text-[11px] shrink-0 ml-auto">— Priya</span>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/5 relative z-10">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Community Memory Active</span>
            </div>
            <Link to="/explore" className="text-white hover:text-violet-300 font-bold py-2 min-h-[44px] inline-flex items-center">
              Join Club Now →
            </Link>
          </div>
        </div>
      </div>

      {/* AI Community Memory Loop */}
      <div className="max-w-4xl mx-auto space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How your community grows
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Every daily activity, doubt solved, and member reflection shapes future activities, helping the club adapt to what students need.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-left">
          <GlassPanel className="p-5 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-white text-sm">Join &amp; Discuss</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Find peers who share your goals, exchange resources, and ask doubts without hesitation.
            </p>
          </GlassPanel>

          <GlassPanel className="p-5 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-semibold text-white text-sm">Do an activity</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Bite-sized daily practice tasks crafted specifically for your club&apos;s subject.
            </p>
          </GlassPanel>

          <GlassPanel className="p-5 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-semibold text-white text-sm">Share what you learned</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Post a brief reflection on your takeaways, problem hurdles, or questions.
            </p>
          </GlassPanel>

          <GlassPanel className="p-5 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="font-semibold text-white text-sm">AI adapts future activities</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Community memory guides AI to curate deeper, more relevant activities over time.
            </p>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
