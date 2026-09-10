export default function GlowButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs font-medium rounded-full",
    md: "px-5 py-2.5 text-sm font-medium rounded-full",
    lg: "px-7 py-3 text-base font-semibold rounded-full",
  };

  const variantClasses = {
    primary:
      "bg-white text-neutral-950 hover:bg-neutral-100 active:scale-[0.98] shadow-sm hover:shadow transition-all duration-200",
    glow:
      "bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-400 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200",
    secondary:
      "bg-neutral-800/80 text-neutral-200 border border-neutral-700/80 hover:bg-neutral-700/80 hover:text-white hover:border-neutral-600 active:scale-[0.98] transition-all duration-200",
    ghost:
      "bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/50 active:scale-[0.98] transition-all duration-200",
    danger:
      "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 active:scale-[0.98] transition-all duration-200",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${
        sizeClasses[size] || sizeClasses.md
      } ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-1 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
}
