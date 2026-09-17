import { Link } from "react-router-dom";

export default function CultureCard({ culture, actionText, actionLink, isMember = false }) {
  if (!culture) return null;

  const accentColor = culture.color || "#8b5cf6";
  const membersCount = culture.membersCount ?? (culture.members?.length || 1);

  // Friendly status badge
  let statusBadge = null;
  if (culture.discovery?.badge === "TRENDING" || culture.discovery?.isTrending) {
    statusBadge = { text: "🔥 Trending", style: "bg-amber-500/15 text-amber-300 border-amber-500/30" };
  } else if (culture.discovery?.badge === "NEW" || culture.discovery?.isNew) {
    statusBadge = { text: "✦ New", style: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" };
  } else if (culture.discovery?.isGrowing) {
    statusBadge = { text: "🌱 Growing", style: "bg-teal-500/15 text-teal-300 border-teal-500/30" };
  } else {
    statusBadge = { text: "● Active now", style: "bg-violet-500/15 text-violet-300 border-violet-500/30" };
  }

  // Friendly category tag
  const categoryTag = culture.vibeWords?.slice(0, 3).join(" • ") || "Community";

  return (
    <div
      className="playful-card group relative overflow-hidden p-5 sm:p-6 flex flex-col justify-between h-full cursor-pointer"
      style={{
        "--card-accent-glow": `${accentColor}35`,
      }}
    >
      {/* Top pastel accent border */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 opacity-85"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40, transparent)`,
        }}
      />

      {/* Ambient background blob */}
      <div
        className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-10 group-hover:opacity-25 transition-opacity duration-300"
        style={{ backgroundColor: accentColor }}
      />

      {/* Decorative tiny stars & dots */}
      <div className="absolute top-3.5 right-4 flex items-center gap-1.5 text-[11px] text-white/20 select-none pointer-events-none">
        <span>✦</span>
        <span>•</span>
      </div>

      <Link to={`/cultures/${culture._id}`} className="block relative z-10 flex-1">
        {/* Card Header: Large playful icon + status tag */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-3deg]"
            style={{
              backgroundColor: `${accentColor}25`,
              boxShadow: `0 4px 14px ${accentColor}25`,
            }}
          >
            {culture.symbol || "✨"}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end pt-0.5">
            {isMember && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Joined
              </span>
            )}
            {statusBadge && (
              <span className={`text-[10px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full border ${statusBadge.style}`}>
                {statusBadge.text}
              </span>
            )}
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1 mb-2.5">
          <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-violet-200 transition-colors">
            {culture.name}
          </h3>
          <p className="text-[11px] font-medium text-neutral-400 capitalize truncate">
            {categoryTag}
          </p>
        </div>

        {/* Short description */}
        <p className="text-xs text-neutral-300/90 line-clamp-2 leading-relaxed mb-4">
          {culture.description}
        </p>

        {/* Today's Activity Teaser */}
        {culture.rituals?.[0] && (
          <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-white/5 mb-4 group-hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-0.5">
              <span className="font-semibold text-violet-300 flex items-center gap-1">
                <span>⚡</span> Today&apos;s activity
              </span>
              <span>Daily</span>
            </div>
            <p className="text-xs text-neutral-200 font-medium line-clamp-1">
              {culture.rituals[0]}
            </p>
          </div>
        )}
      </Link>

      {/* Bottom Footer: Stats + Action Arrow */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between relative z-10 text-xs">
        <div className="text-neutral-400 font-medium flex items-center gap-2">
          <span>{membersCount} {membersCount === 1 ? "member" : "members"}</span>
        </div>

        <Link
          to={actionLink || `/cultures/${culture._id}`}
          className="inline-flex items-center gap-1.5 font-semibold text-white/90 group-hover:text-white group-hover:translate-x-0.5 transition-all"
        >
          <span className="text-xs">{actionText || (isMember ? "Open Club" : "Join Club")}</span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center border border-white/10 group-hover:border-white/25 transition-all shadow-sm"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            →
          </div>
        </Link>
      </div>
    </div>
  );
}
