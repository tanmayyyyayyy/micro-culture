export default function MicroCultureLogo({
  size = "md",
  showWordmark = true,
  className = "",
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
      {/* Friendly Community Emblem Tile */}
      <div
        className={`relative ${currentSize.icon} flex-shrink-0 flex items-center justify-center transition-transform duration-200 ease-out group-hover:scale-105`}
      >
        <div
          className={`w-full h-full ${currentSize.badge} bg-white flex items-center justify-center p-1.5 shadow-xs`}
          style={{
            border: "1.5px solid rgba(23, 23, 43, 0.09)",
            boxShadow: "0 2px 8px rgba(23, 23, 43, 0.05)",
          }}
        >
          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="logoMGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            {/* Connecting community orbit */}
            <path
              d="M 10 11 C 14 6 22 6 26 11"
              stroke="rgba(23,23,43,0.14)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Rounded M arches symbolizing connection with vivid gradient */}
            <path
              d="M 9 26 V 15 C 9 12 11.5 10.5 13.5 12 L 18 16.5 L 22.5 12 C 24.5 10.5 27 12 27 15 V 26"
              stroke="url(#logoMGrad)"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Three diverse community interest nodes */}
            <circle cx="9" cy="9" r="2.2" fill="#EC4899" />
            <circle cx="18" cy="5.5" r="2.4" fill="#F59E0B" />
            <circle cx="27" cy="9" r="2.2" fill="#8B5CF6" />
          </svg>
        </div>
      </div>

      {/* Wordmark in clean bold #17172B */}
      {showWordmark && (
        <span
          className={`font-black tracking-tight ${currentSize.text} select-none text-[#17172B]`}
        >
          Micro Culture
        </span>
      )}
    </div>
  );
}

