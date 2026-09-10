export default function GlassPanel({
  children,
  className = "",
  interactive = false,
  onClick,
  ...props
}) {
  const baseClass = interactive ? "glass-panel-interactive cursor-pointer" : "glass-panel";
  return (
    <div
      className={`rounded-2xl ${baseClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
