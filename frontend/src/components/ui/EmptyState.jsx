export default function EmptyState({
  icon = "✧",
  title = "No items found",
  description = "",
  action,
  className = "py-16",
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 ${className}`}>
      <div
        className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-4 shadow-sm"
        style={{
          background: "rgba(26,26,46,0.05)",
          border: "1.5px solid rgba(26,26,46,0.08)",
        }}
      >
        {icon}
      </div>
      <h3 className="text-base font-bold mb-1" style={{ color: "#1A1A2E" }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm max-w-sm mb-6 leading-relaxed" style={{ color: "#94A3B8" }}>
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
