export default function MicroCultureLogo({
  size = "md",
  showWordmark = true,
  className = "",
  glow = true,
  ariaLabel = "Micro Culture",
}) {
  const sizeMap = {
    xs: { icon: "w-6 h-6", text: "text-xs", gap: "gap-1.5", badge: "rounded-lg" },
    sm: { icon: "w-7 h-7", text: "text-sm", gap: "gap-2", badge: "rounded-xl" },
    md: { icon: "w-9 h-9", text: "text-base", gap: "gap-2.5", badge: "rounded-xl" },
    lg: { icon: "w-11 h-11", text: "text-lg", gap: "gap-3", badge: "rounded-2xl" },
    xl: { icon: "w-13 h-13", text: "text-xl", gap: "gap-3.5", badge: "rounded-2xl" },
    "2xl": { icon: "w-16 h-16", text: "text-2xl", gap: "gap-4", badge: "rounded-3xl" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`inline-flex items-center ${currentSize.gap} group ${className}`}
      aria-label={ariaLabel}
    >
      {/* Friendly Rounded Monogram Tile */}
      <div
        className={`relative ${currentSize.icon} flex-shrink-0 flex items-center justify-center transition-transform duration-250 ease-out group-hover:scale-105`}
      >
        {/* Soft shadow / pastel glow */}
        {glow && (
          <div
            className="absolute inset-0 rounded-2xl blur-sm opacity-50 transition-opacity duration-300 group-hover:opacity-80"
            style={{
              background: "linear-gradient(135deg, #C9B6FF 0%, #FFB38A 100%)",
            }}
          />
        )}

        {/* Vector Emblem on Pastel Gradient Tile */}
        <div
          className={`relative z-10 w-full h-full ${currentSize.badge} flex items-center justify-center p-1.5 shadow-sm`}
          style={{
            background: "linear-gradient(135deg, #C9B6FF 0%, #FF7F8A 50%, #FFD966 100%)",
            boxShadow: "0 2px 8px rgba(23, 23, 43, 0.08)",
          }}
        >
          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-xs"
            aria-hidden="true"
          >
            {/* Playful rounded M monogram in clean white */}
            <path
              d="M 9 26 V 12.5 C 9 10.5 11 9.5 12.5 11 L 18 17 L 23.5 11 C 25 9.5 27 10.5 27 12.5 V 26"
              stroke="#FFFFFF"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Little playful sparkle/satellite dot */}
            <circle cx="27" cy="8" r="2.2" fill="#FFFDF7" />
          </svg>
        </div>
      </div>

      {/* Wordmark in dark #17172B */}
      {showWordmark && (
        <span
          className={`font-extrabold tracking-tight ${currentSize.text} select-none transition-colors duration-200`}
          style={{ color: "#17172B" }}
        >
          Micro<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500">Culture</span>
        </span>
      )}
    </div>
  );
}
