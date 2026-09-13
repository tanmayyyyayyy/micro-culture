export default function MicroCultureLogo({
  size = "md",
  showWordmark = true,
  className = "",
  glow = true,
  ariaLabel = "Micro Culture",
}) {
  const sizeMap = {
    xs: { icon: "w-5 h-5", text: "text-sm", gap: "gap-1.5" },
    sm: { icon: "w-6 h-6", text: "text-sm", gap: "gap-2" },
    md: { icon: "w-8 h-8", text: "text-base", gap: "gap-2.5" },
    lg: { icon: "w-10 h-10", text: "text-lg", gap: "gap-3" },
    xl: { icon: "w-12 h-12", text: "text-xl", gap: "gap-3.5" },
    "2xl": { icon: "w-16 h-16", text: "text-2xl", gap: "gap-4" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`inline-flex items-center ${currentSize.gap} group ${className}`}
      aria-label={ariaLabel}
    >
      {/* Orbital Monogram Icon */}
      <div
        className={`relative ${currentSize.icon} flex-shrink-0 flex items-center justify-center transition-transform duration-250 ease-out group-hover:scale-[1.04]`}
      >
        {/* Ambient Backlight Glow */}
        {glow && (
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/30 to-indigo-500/20 rounded-full blur-sm pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-75" />
        )}

        {/* Vector SVG Emblem */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-[0_2px_8px_rgba(139,92,246,0.25)]"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id={`mc-glow-${size}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#6366f1" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`mc-grad-${size}`} x1="15%" y1="15%" x2="85%" y2="85%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#ddd6fe" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id={`mc-arc-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="60%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>

          {/* Subtle cosmic circle base */}
          <circle cx="50" cy="50" r="46" fill={`url(#mc-glow-${size})`} />

          {/* Orbital arc wrapping around monogram */}
          <path
            d="M 78 24 A 41 41 0 1 0 45 91"
            stroke={`url(#mc-arc-${size})`}
            strokeWidth="4.2"
            strokeLinecap="round"
          />

          {/* Terminal node on arc */}
          <circle cx="45" cy="91" r="2.8" fill="#e0e7ff" />

          {/* Orbiting celestial satellite dot */}
          <circle cx="73" cy="74" r="3.4" fill="#ffffff" />
          <circle cx="73" cy="74" r="5" stroke="#818cf8" strokeWidth="1" opacity="0.6" />

          {/* Central architectural "M" monogram */}
          <path
            d="M 36 68 V 32 L 50 62 L 64 32 V 68"
            stroke={`url(#mc-grad-${size})`}
            strokeWidth="4.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <span
          className={`font-bold tracking-tight text-white ${currentSize.text} select-none transition-opacity duration-200 group-hover:opacity-100`}
        >
          Micro<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">Culture</span>
        </span>
      )}
    </div>
  );
}
