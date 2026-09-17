import { Link } from "react-router-dom";

const COMMUNITY_IDENTITY = {
  gateverse:            { primary: "#FFAD5A", accent: "#FFD966", bg: "#FFF8ED", emoji: "📚" },
  "java junction":      { primary: "#FF7F8A", accent: "#FFB38A", bg: "#FFF2F0", emoji: "☕" },
  "pixel playground":   { primary: "#F58AC6", accent: "#C9B6FF", bg: "#FFF0F7", emoji: "🎨" },
  blockbuilders:        { primary: "#8DBBFF", accent: "#A78BFA", bg: "#F0F5FF", emoji: "⛓️" },
  "cyber sentinels":    { primary: "#67D7C8", accent: "#9BE7C4", bg: "#EDFCFA", emoji: "🛡️" },
  hacknights:           { primary: "#FF7F8A", accent: "#F58AC6", bg: "#FFF0F4", emoji: "🚀" },
  "dsa dojo":           { primary: "#A78BFA", accent: "#C9B6FF", bg: "#F5F2FF", emoji: "🥋" },
  codecanvas:           { primary: "#FFAD5A", accent: "#FFD966", bg: "#FFFBF0", emoji: "💻" },
  "neural nest":        { primary: "#A78BFA", accent: "#C9B6FF", bg: "#FAF3FF", emoji: "🧠" },
  "open source orbit":  { primary: "#8DBBFF", accent: "#9BE7C4", bg: "#EFFBF8", emoji: "🌐" },
  codesprint:           { primary: "#FF6B6B", accent: "#FFAD5A", bg: "#FFF1F1", emoji: "⚡" },
  "career launchpad":   { primary: "#FFB38A", accent: "#A78BFA", bg: "#FFF6F2", emoji: "🎯" },
  "devops dock":        { primary: "#67D7C8", accent: "#8DBBFF", bg: "#EDFBFF", emoji: "🐳" },
  "project playground": { primary: "#F58AC6", accent: "#FFD966", bg: "#FFF4F7", emoji: "🛠️" },
};

function getIdentity(name = "", fallbackColor = "#A78BFA") {
  const key = name.toLowerCase().trim();
  // Exact match
  if (COMMUNITY_IDENTITY[key]) return COMMUNITY_IDENTITY[key];
  // Partial match
  for (const [k, v] of Object.entries(COMMUNITY_IDENTITY)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  // Fallback: derive soft pastel from fallback
  return { primary: fallbackColor, accent: "#FFD966", bg: "#F8F7FF", emoji: "✨" };
}

export default function CultureCard({ culture, actionText, actionLink, isMember = false }) {
  if (!culture) return null;

  const identity = getIdentity(culture.name, culture.color || "#A78BFA");
  const membersCount = culture.membersCount ?? (culture.members?.length || 1);

  // Use community identity emoji if culture doesn't have a distinct symbol
  const displaySymbol = culture.symbol && culture.symbol !== "✨"
    ? culture.symbol
    : identity.emoji;

  // Friendly status text
  let statusText = "Active";
  let statusBg = "rgba(23,23,43,0.06)";
  let statusColor = "#687085";
  if (culture.discovery?.isTrending || culture.discovery?.badge === "TRENDING") {
    statusText = "🔥 Trending";
    statusBg = "#FEF3C7";
    statusColor = "#92400E";
  } else if (culture.discovery?.isNew || culture.discovery?.badge === "NEW") {
    statusText = "✦ New";
    statusBg = "#ECFDF5";
    statusColor = "#065F46";
  } else if (culture.discovery?.isGrowing) {
    statusText = "🌱 Growing";
    statusBg = "#F0FDF4";
    statusColor = "#14532D";
  }

  const categoryTag = culture.vibeWords?.slice(0, 2).join(" · ") || "";

  return (
    <div
      className="community-card group flex flex-col h-full"
      style={{ "--community-primary": identity.primary }}
    >
      {/* Colorful top zone with oversized icon */}
      <div
        className="relative overflow-hidden flex items-end px-5 pt-5 pb-4"
        style={{
          background: `linear-gradient(145deg, ${identity.bg} 0%, ${identity.primary}25 100%)`,
          minHeight: "110px",
        }}
      >
        {/* Decorative organic blobs behind icon */}
        <div
          className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-35 pointer-events-none"
          style={{ background: identity.accent || identity.primary, filter: "blur(8px)" }}
          aria-hidden="true"
        />
        <div
          className="absolute top-2 right-12 w-10 h-10 rounded-full opacity-25 pointer-events-none"
          style={{ background: identity.primary }}
          aria-hidden="true"
        />

        {/* Oversized icon */}
        <div
          className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300"
          style={{
            background: "rgba(255,255,255,0.92)",
            border: `2px solid ${identity.primary}35`,
          }}
        >
          {displaySymbol}
        </div>

        {/* Status badge */}
        {isMember ? (
          <span
            className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs"
            style={{ background: "#17172B", color: "#fff" }}
          >
            Joined
          </span>
        ) : (
          <span
            className="absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-xs"
            style={{ background: statusBg, color: statusColor }}
          >
            {statusText}
          </span>
        )}
      </div>

      {/* Card body */}
      <Link
        to={`/cultures/${culture._id}`}
        className="block flex-1 px-5 pt-3 pb-2"
      >
        <h3
          className="text-[17px] font-extrabold leading-tight tracking-tight mb-0.5"
          style={{ color: "#17172B" }}
        >
          {culture.name}
        </h3>
        {categoryTag && (
          <p className="text-[11px] font-medium capitalize mb-2" style={{ color: "#687085" }}>
            {categoryTag}
          </p>
        )}
        <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: "#4B5563" }}>
          {culture.description}
        </p>

        {/* Today's activity teaser */}
        {culture.rituals?.[0] && (
          <div
            className="px-3 py-2 rounded-xl mb-3 text-[11px]"
            style={{ background: `${identity.primary}15`, border: `1.5px solid ${identity.primary}35` }}
          >
            <span className="font-bold" style={{ color: "#17172B" }}>
              ⚡ Today:{" "}
            </span>
            <span style={{ color: "#4B5563" }} className="line-clamp-1">
              {culture.rituals[0]}
            </span>
          </div>
        )}
      </Link>

      {/* Footer: members count + circular CTA */}
      <div
        className="mx-5 mb-4 pt-3 flex items-center justify-between"
        style={{ borderTop: "1.5px solid rgba(23,23,43,0.06)" }}
      >
        <span className="text-xs font-medium" style={{ color: "#687085" }}>
          {membersCount} {membersCount === 1 ? "member" : "members"}
        </span>
        <Link
          to={actionLink || `/cultures/${culture._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold pl-3 pr-2 py-1 rounded-full transition-all duration-200 group-hover:scale-105"
          style={{
            background: "#17172B",
            color: "#fff",
          }}
        >
          <span>{actionText || (isMember ? "Open" : "Join")}</span>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">→</span>
        </Link>
      </div>
    </div>
  );
}
