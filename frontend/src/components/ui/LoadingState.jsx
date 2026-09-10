export default function LoadingState({
  message = "Loading...",
  subtext = "",
  className = "py-16",
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
        <div className="absolute inset-0 rounded-full blur-md bg-violet-500/20" />
      </div>
      <p className="text-sm font-medium text-neutral-300 tracking-wide">{message}</p>
      {subtext && <p className="text-xs text-neutral-500 mt-1 max-w-xs">{subtext}</p>}
    </div>
  );
}
