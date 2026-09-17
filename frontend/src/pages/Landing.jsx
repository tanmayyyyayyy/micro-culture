import { Link } from "react-router-dom";
import GlowButton from "../components/ui/GlowButton.jsx";
import GlassPanel from "../components/ui/GlassPanel.jsx";
import CultureEmblem from "../components/ui/CultureEmblem.jsx";
import MicroCultureLogo from "../components/ui/MicroCultureLogo.jsx";

export default function Landing() {
  return (
    <div className="space-y-12 sm:space-y-16 py-6 sm:py-10 animate-fadeIn">
      {/* Hero Section — Above the fold */}
      <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-5">
        <div className="flex justify-center mb-1">
          <MicroCultureLogo size="2xl" showWordmark={false} />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
          Social Communities + Daily AI Activities
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Create communities around the{" "}
          <span className="text-gradient-purple">things you care about</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-neutral-300 max-w-xl mx-auto leading-relaxed">
          Join a community, take part in daily activities, and let AI help your community grow.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-1 w-full max-w-sm sm:max-w-none mx-auto">
          <Link to="/explore" className="w-full sm:w-auto">
            <GlowButton variant="glow" size="lg" className="w-full sm:w-auto justify-center min-h-[48px]">
              Explore Communities →
            </GlowButton>
          </Link>
          <Link to="/create" className="w-full sm:w-auto">
            <GlowButton variant="secondary" size="lg" className="w-full sm:w-auto justify-center min-h-[48px]">
              Create a Community
            </GlowButton>
          </Link>
        </div>

        {/* 3-Step Overview: How it works */}
        <div className="pt-3 max-w-2xl mx-auto space-y-2">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            How it works
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left space-y-0.5">
              <div className="text-xs font-semibold text-violet-300">1. Join a Community</div>
              <p className="text-[11px] text-neutral-400 leading-snug">Find people who share your craft, interests, or practice.</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left space-y-0.5">
              <div className="text-xs font-semibold text-cyan-300">2. Do Daily Activities</div>
              <p className="text-[11px] text-neutral-400 leading-snug">Take part in bite-sized daily prompts created for your group.</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left space-y-0.5">
              <div className="text-xs font-semibold text-amber-300">3. AI Learns &amp; Adapts</div>
              <p className="text-[11px] text-neutral-400 leading-snug">Community reflections guide what activities appear next.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Demo Card — Prioritizing Community Identity over Activity */}
      <div className="max-w-2xl mx-auto">
        <GlassPanel className="p-5 sm:p-8 relative overflow-hidden border-violet-500/20 shadow-2xl">
          {/* Community Identity Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <CultureEmblem symbol="🪐" color="#a855f7" size="md" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-white text-base">
                    The Midnight Cartographers
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Community
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  12 members · 19 activities this week
                </p>
              </div>
            </div>
            <Link to="/explore" className="self-start sm:self-auto">
              <GlowButton size="sm" variant="secondary" className="min-h-[36px]">
                View Community
              </GlowButton>
            </Link>
          </div>

          <p className="text-sm text-neutral-300 leading-relaxed mb-4">
            A community for people who enjoy exploring the night sky, maps, and quiet observation.
          </p>

          {/* Today's Activity (Feature of the community) */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-violet-400 font-medium text-xs">
                Today&apos;s Activity: The Horizon Ledger
              </span>
              <span className="text-neutral-500 font-mono text-[11px]">15 min · Easy</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Step out at dusk, locate a single celestial landmark, and sketch the skyline silhouette using only unbroken lines.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-violet-300">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span>AI Memory Active</span>
            </div>
            <Link to="/explore" className="text-white hover:text-violet-300 font-medium py-2 min-h-[44px] inline-flex items-center">
              Join Community →
            </Link>
          </div>
        </GlassPanel>
      </div>

      {/* AI Community Memory Loop */}
      <div className="max-w-4xl mx-auto space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            How your community grows
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Every daily activity and member reflection shapes future activities, helping the community evolve naturally over time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-left">
          <GlassPanel className="p-4 sm:p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-semibold text-white text-sm">Do an activity</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Short, meaningful activities created specifically for your community&apos;s niche.
            </p>
          </GlassPanel>

          <GlassPanel className="p-4 sm:p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-semibold text-white text-sm">Share what you learned</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Post a brief reflection on what you noticed, felt, or discovered.
            </p>
          </GlassPanel>

          <GlassPanel className="p-4 sm:p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-semibold text-white text-sm">Your community remembers</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Member reflections are saved to form your community&apos;s living memory.
            </p>
          </GlassPanel>

          <GlassPanel className="p-4 sm:p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="font-semibold text-white text-sm">AI uses that memory</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Future activities adapt over time based on what your community has experienced.
            </p>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
