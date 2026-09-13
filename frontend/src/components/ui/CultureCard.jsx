import { Link } from "react-router-dom";
import GlassPanel from "./GlassPanel.jsx";
import CultureEmblem from "./CultureEmblem.jsx";
import { ProgressionBadge } from "./ProgressionBadge.jsx";

export default function CultureCard({ culture, actionText, actionLink, isMember = false }) {
  if (!culture) return null;

  const formattedRecentActivity = culture.discovery?.recentActivityText
    ? culture.discovery.recentActivityText
        .replace(/(\d+)\s+rites\s+this\s+week/i, "$1 activities this week")
        .replace(/(\d+)\s+rite\s+this\s+week/i, "$1 activity this week")
    : null;

  return (
    <GlassPanel interactive className="group p-5 flex flex-col justify-between h-full">
      <Link to={`/cultures/${culture._id}`} className="block">
        {/* 1. Community Identity Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <CultureEmblem
              symbol={culture.symbol}
              color={culture.color}
              size="md"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-neutral-100 group-hover:text-white transition-colors">
                  {culture.name}
                </h3>
                {isMember && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Member
                  </span>
                )}
                {culture.discovery?.badge && (
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      culture.discovery.badge === "TRENDING"
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        : culture.discovery.badge === "NEW"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                    }`}
                  >
                    {culture.discovery.badge === "TRENDING"
                      ? "🔥 Trending"
                      : culture.discovery.badge === "NEW"
                      ? "✦ New"
                      : "⚡ Active"}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>{culture.membersCount ?? (culture.members?.length || 1)} members</span>
                {formattedRecentActivity && (
                  <>
                    <span className="text-neutral-600">•</span>
                    <span className="text-neutral-300 font-medium text-[11px]">
                      {formattedRecentActivity}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 2. What people do here / Community description */}
        <p className="text-sm text-neutral-300 line-clamp-2 leading-relaxed mb-3">
          {culture.description}
        </p>

        {/* 3. Vibe tags */}
        {culture.vibeWords?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {culture.vibeWords.slice(0, 3).map((word, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-800/80 text-neutral-300 border border-neutral-700/60"
              >
                #{word}
              </span>
            ))}
          </div>
        )}

        {/* 4. Today's Activity (feature of the community) */}
        {culture.rituals?.[0] && (
          <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/80 mb-3 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-violet-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <span>⚡</span> Today&apos;s Activity
              </span>
              <span className="text-neutral-500 font-mono text-[10px]">Daily</span>
            </div>
            <p className="text-xs font-medium text-neutral-200 line-clamp-1">
              {culture.rituals[0]}
            </p>
          </div>
        )}
      </Link>

      {/* Progression mini-row */}
      {culture.progression && (
        <div style={{ marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
            <ProgressionBadge progression={culture.progression} />
            <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)" }}>
              {culture.progression.progress}%
            </span>
          </div>
          <div style={{ height: "3px", borderRadius: "999px", background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${culture.progression.progress}%`,
                borderRadius: "999px",
                background: "linear-gradient(90deg, #8b5cf699, #8b5cf6)",
                animation: "progressFill 0.7s cubic-bezier(0.22,0.61,0.36,1) both",
              }}
            />
          </div>
        </div>
      )}

      {/* Action Row */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs gap-2">
        <Link
          to={`/cultures/${culture._id}`}
          className="text-neutral-400 hover:text-white transition-colors py-2 min-h-[38px] inline-flex items-center"
        >
          View Community
        </Link>
        <Link
          to={actionLink || `/cultures/${culture._id}`}
          className="inline-flex items-center gap-1 font-medium text-violet-400 hover:text-violet-300 transition-colors py-2 min-h-[38px]"
        >
          {actionText || (isMember ? "Today's Activity →" : "Join Community →")}
        </Link>
      </div>
    </GlassPanel>
  );
}
