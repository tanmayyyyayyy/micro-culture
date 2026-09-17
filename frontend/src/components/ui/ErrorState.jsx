import GlowButton from "./GlowButton.jsx";

export default function ErrorState({
  title = "Something went wrong",
  message = "Failed to load data. Please try again.",
  onRetry,
  className = "py-12",
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 animate-fadeIn ${className}`}>
      <div
        className="w-13 h-13 rounded-2xl flex items-center justify-center mb-3 p-3"
        style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#EF4444" }}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-sm font-bold mb-1" style={{ color: "#1A1A2E" }}>
        {title}
      </h3>
      <p className="text-xs max-w-sm mb-4" style={{ color: "#94A3B8" }}>
        {message}
      </p>
      {onRetry && (
        <GlowButton size="sm" variant="secondary" onClick={onRetry}>
          Try again
        </GlowButton>
      )}
    </div>
  );
}
