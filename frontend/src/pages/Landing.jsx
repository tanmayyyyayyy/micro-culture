import { Link } from "react-router-dom";
import GlowButton from "../components/ui/GlowButton.jsx";
import GlassPanel from "../components/ui/GlassPanel.jsx";
import CultureEmblem from "../components/ui/CultureEmblem.jsx";

export default function Landing() {
  return (
    <div className="space-y-20 py-8 sm:py-16 animate-fadeIn">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-2">
          <span>✦</span> An AI-Powered Social Experiment
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Where small communities{" "}
          <span className="text-gradient-purple">evolve their own lore</span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-300 max-w-xl mx-auto leading-relaxed">
          Create fictional micro-cultures with sacred values, invented jargon, and an AI ritual engine that remembers every member&apos;s reflection.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
          <Link to="/signup">
            <GlowButton variant="glow" size="lg">
              Found a Culture →
            </GlowButton>
          </Link>
          <Link to="/explore">
            <GlowButton variant="secondary" size="lg">
              Explore Living Cultures
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
              Active Rite
            </span>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-violet-400 font-semibold uppercase tracking-wider text-[10px]">
                Today&apos;s Rite: The Horizon Ledger
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
              <span>Cultural Memory Loop Active</span>
            </div>
            <Link to="/explore" className="text-white hover:text-violet-300 underline font-medium">
              Partake in cultures like this →
            </Link>
          </div>
        </GlassPanel>
      </div>

      {/* How It Works: The 3-Step Living Cycle */}
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            The Living Culture Loop
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            A continuous dialogue between collective human reflection and generative ritual.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <GlassPanel className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-semibold text-white text-base">The Charter</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Generate an AI blueprint with custom lexicon, sacred values, and community aesthetics.
            </p>
          </GlassPanel>

          <GlassPanel className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-semibold text-white text-base">Daily Rites</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Every day brings a unique ritual tailored to the culture&apos;s momentum and traditions.
            </p>
          </GlassPanel>

          <GlassPanel className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-semibold text-white text-base">Communal Memory</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Member reflections enter the culture&apos;s memory bank, teaching the AI how to adapt tomorrow&apos;s rites.
            </p>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
