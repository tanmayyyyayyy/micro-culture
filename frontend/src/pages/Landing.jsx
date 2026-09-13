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
          <span>✦</span> Social Communities + Daily AI Activities
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Create communities around the{" "}
          <span className="text-gradient-purple">things you care about</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-neutral-300 max-w-xl mx-auto leading-relaxed">
          Join a community, take part in daily activities, and let AI help your community grow.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-3 pt-1">
          <Link to="/explore">
            <GlowButton variant="glow" size="lg">
              Explore Communities →
            </GlowButton>
          </Link>
          <Link to="/create">
            <GlowButton variant="secondary" size="lg">
              Create a Community
            </GlowButton>
          </Link>
        </div>

        {/* 3-Step Instant Clarity Summary — Visible without scrolling */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 max-w-2xl mx-auto">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-left space-y-1">
            <div className="text-xs font-bold text-violet-400">1. Join a Community</div>
            <p className="text-xs text-neutral-300">Find people who share your interests.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-left space-y-1">
            <div className="text-xs font-bold text-cyan-400">2. Do Daily Activities</div>
            <p className="text-xs text-neutral-300">Take part in simple activities created for your community.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-left space-y-1">
            <div className="text-xs font-bold text-amber-400">3. AI Learns &amp; Adapts</div>
            <p className="text-xs text-neutral-300">Your community&apos;s activity helps AI create better activities over time.</p>
          </div>
        </div>
      </div>

      {/* Community Demo Card — Prioritizing Community Identity over Activity */}
      <div className="max-w-2xl mx-auto">
        <GlassPanel className="p-6 sm:p-8 relative overflow-hidden border-violet-500/20 shadow-2xl">
          {/* Community Identity Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <CultureEmblem symbol="🪐" color="#a855f7" size="md" />
              <div>
                <div className="flex items-center gap-2">
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
            <Link to="/explore">
              <GlowButton size="xs" variant="secondary">
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
              <span className="text-violet-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <span>⚡</span> Today&apos;s Activity: The Horizon Ledger
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
            <Link to="/explore" className="text-white hover:text-violet-300 font-medium">
              Join Community →
            </Link>
          </div>
        </GlassPanel>
      </div>

      {/* AI Explanation / Simple Living Cycle */}
      <div className="max-w-3xl mx-auto space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Your community gets smarter over time
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
            AI looks at your community&apos;s past activities and participation to create new activities that fit the group.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 text-left">
          <GlassPanel className="p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-semibold text-white text-sm">Create or join</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Start a community for your niche interest, or browse active groups.
            </p>
          </GlassPanel>

          <GlassPanel className="p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-semibold text-white text-sm">Participate daily</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Do short, meaningful activities and share a one-line reflection.
            </p>
          </GlassPanel>

          <GlassPanel className="p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-semibold text-white text-sm">AI adapts</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Every reflection teaches AI what your community loves, improving future activities.
            </p>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
