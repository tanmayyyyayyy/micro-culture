import { Link } from "react-router-dom";
import GlowButton from "../components/ui/GlowButton.jsx";
import GlassPanel from "../components/ui/GlassPanel.jsx";
import CultureEmblem from "../components/ui/CultureEmblem.jsx";
import MicroCultureLogo from "../components/ui/MicroCultureLogo.jsx";

export default function Landing() {
  return (
    <div className="space-y-20 py-8 sm:py-16 animate-fadeIn">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="flex justify-center mb-1">
          <MicroCultureLogo size="2xl" showWordmark={false} />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-2">
          <span>✦</span> AI-powered communities
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Where communities don&apos;t just gather —{" "}
          <span className="text-gradient-purple">they grow together</span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-300 max-w-xl mx-auto leading-relaxed">
          Create or join a small community with its own interests, activities, and traditions. AI creates a unique daily activity based on what your community does together.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
          <Link to="/signup">
            <GlowButton variant="glow" size="lg">
              Create a Community →
            </GlowButton>
          </Link>
          <Link to="/explore">
            <GlowButton variant="secondary" size="lg">
              Explore Communities
            </GlowButton>
          </Link>
        </div>
      </div>

      {/* Interactive Culture Demo Teaser */}
      <div className="max-w-2xl mx-auto">
        <GlassPanel className="p-6 sm:p-8 relative overflow-hidden border-violet-500/20 shadow-2xl">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <CultureEmblem symbol="🪐" color="#a855f7" size="md" />
              <div>
                <h3 className="font-bold text-white text-base">
                  The Midnight Cartographers
                </h3>
                <p className="text-xs text-neutral-400">
                  Values: Solitude · Precision · Starlight
                </p>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
              Active Activity
            </span>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-violet-400 font-semibold uppercase tracking-wider text-[10px]">
                Today&apos;s Activity: The Horizon Ledger
              </span>
              <span className="text-neutral-500 font-mono">15 min · Easy</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Step out at dusk, locate a single celestial landmark, and sketch the skyline silhouette using only unbroken lines.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-violet-300">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span>Community Memory Active</span>
            </div>
            <Link to="/explore" className="text-white hover:text-violet-300 underline font-medium">
              Join communities like this →
            </Link>
          </div>
        </GlassPanel>
      </div>

      {/* How It Works: The 3-Step Living Cycle */}
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            How it works
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Three simple steps to build a community that grows over time.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <GlassPanel className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-semibold text-white text-base">Create your community</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Give your community a name, a purpose, and a vibe. AI builds out the values, traditions, and style.
            </p>
          </GlassPanel>

          <GlassPanel className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-semibold text-white text-base">Do the daily activity</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Every day, AI generates a short activity tailored to your community&apos;s interests and history.
            </p>
          </GlassPanel>

          <GlassPanel className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-semibold text-white text-base">Build shared memory</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Your reflections are remembered. AI learns what your community enjoys and makes future activities better.
            </p>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
