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
    sm: "px-4 py-2 text-xs font-semibold rounded-full",
    md: "px-6 py-2.5 text-sm font-semibold rounded-full",
    lg: "px-8 py-3.5 text-base font-semibold rounded-full",
  };

  // Warm, playful button styles for the light social theme
  const variantClasses = {
    // Primary: dark fill — confident, readable
    primary:
      "bg-[#17172B] text-white hover:bg-[#2d2d4e] active:scale-[0.97] active:brightness-95 shadow-sm hover:shadow-md transition-all duration-200 ease-out",
    // Glow: vibrant dark fill — energetic primary CTA
    glow:
      "bg-[#17172B] text-white hover:bg-[#2d2d4e] active:scale-[0.97] shadow-md hover:shadow-lg transition-all duration-200 ease-out",
    // Secondary: white with border — light, secondary action
    secondary:
      "bg-white text-[#17172B] border-2 border-[rgba(23,23,43,0.15)] hover:border-[rgba(23,23,43,0.3)] hover:bg-neutral-50 active:scale-[0.97] shadow-sm hover:shadow transition-all duration-200 ease-out",
    // Ghost: transparent, subtle
    ghost:
      "bg-transparent text-[#687085] hover:text-[#17172B] hover:bg-[rgba(23,23,43,0.06)] active:scale-[0.97] transition-all duration-200 ease-out",
    // Danger: soft red
    danger:
      "bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100 hover:text-red-700 active:scale-[0.97] transition-all duration-200 ease-out",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 cursor-pointer
        outline-none
        focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:active:brightness-100
        ${sizeClasses[size] || sizeClasses.md}
        ${variantClasses[variant] || variantClasses.primary}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-1 h-4 w-4 text-current flex-shrink-0"
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
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
