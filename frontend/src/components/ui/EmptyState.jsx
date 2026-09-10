export default function EmptyState({
  icon = "✧",
  title = "No items found",
  description = "",
  action,
  className = "py-16",
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 flex items-center justify-center text-2xl text-neutral-400 mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-base font-medium text-neutral-200 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-400 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
