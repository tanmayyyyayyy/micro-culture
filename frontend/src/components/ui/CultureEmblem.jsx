export default function CultureEmblem({
  symbol = "✨",
  color = "#8b5cf6",
  size = "md",
  className = "",
}) {
  const sizeMap = {
    sm: "w-8 h-8 text-lg",
    md: "w-12 h-12 text-2xl",
    lg: "w-16 h-16 text-3xl",
    xl: "w-20 h-20 text-4xl",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-neutral-900/80 border border-white/10 shadow-inner flex-shrink-0 ${
        sizeMap[size] || sizeMap.md
      } ${className}`}
      style={{
        boxShadow: `0 0 20px -5px ${color || "#8b5cf6"}40`,
      }}
    >
      <span className="select-none leading-none transform transition-transform duration-300 group-hover:scale-110">
        {symbol || "✨"}
      </span>
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color || "#8b5cf6"}, transparent 70%)`,
        }}
      />
    </div>
  );
}
