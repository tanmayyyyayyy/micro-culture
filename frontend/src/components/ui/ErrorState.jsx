import GlowButton from "./GlowButton.jsx";

export default function ErrorState({
  title = "Something went wrong",
  message = "Failed to load data. Please try again.",
  onRetry,
  className = "py-12",
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-neutral-200 mb-1">{title}</h3>
      <p className="text-xs text-neutral-400 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <GlowButton size="sm" variant="secondary" onClick={onRetry}>
          Try again
        </GlowButton>
      )}
    </div>
  );
}
