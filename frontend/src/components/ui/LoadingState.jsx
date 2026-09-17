import { useEffect, useState } from "react";
import GlassPanel from "./GlassPanel.jsx";
import MicroCultureLogo from "./MicroCultureLogo.jsx";

/**
 * P5.2 — Polished API Cold-Start Loading Experience
 *
 * Progressive stages:
 * - Stage 0 (0 - 1.8s): Standard subtle spinner with initial message.
 *   Fast API responses (< 1.8s) unmount before cold-start messaging ever displays.
 * - Stage 1 (1.8s - 4.0s): Enhanced cold-start glass card with pulsing M emblem:
 *   "Getting Micro Culture ready..." / "Connecting to your communities"
 * - Stage 2 (4.0s+): Smooth text update for slow waking backend:
 *   "Still connecting..." / "Thanks for waiting — we're getting things ready."
 */
export default function LoadingState({
  message = "Loading...",
  subtext = "",
  className = "py-16",
  isColdStartAware = true,
  wakeTitle = "Getting Micro Culture ready...",
  wakeSubtext = "Connecting to your communities",
  slowTitle = "Still connecting...",
  slowSubtext = "Thanks for waiting — we're getting things ready.",
}) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!isColdStartAware) return;

    // Transition to Stage 1 after ~1.8s if request is still pending
    const timer1 = setTimeout(() => {
      setStage(1);
    }, 1800);

    // Transition to Stage 2 after ~4.0s if backend is still waking up
    const timer2 = setTimeout(() => {
      setStage(2);
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isColdStartAware]);

  // Stage 0: Standard fast loading state (< 1.8s)
  if (stage === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center px-4 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="relative mb-4">
          <div className="w-10 h-10 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
          <div className="absolute inset-0 rounded-full blur-md bg-violet-500/20" />
        </div>
        <p className="text-sm font-medium text-neutral-300 tracking-wide">{message}</p>
        {subtext && <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">{subtext}</p>}
      </div>
    );
  }

  // Stage 1 & Stage 2: Polished cold-start card (>= 1.8s)
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      <GlassPanel className="p-5 sm:p-6 max-w-xs sm:max-w-sm w-full mx-auto border-white/10 shadow-2xl animate-fadeIn">
        {/* M logo emblem with subtle pulse & ambient purple glow */}
        <div className="flex justify-center mb-3">
          <div className="relative animate-pulse">
            <MicroCultureLogo size="lg" showWordmark={false} glow={true} />
          </div>
        </div>

        {/* Progressive cold-start messaging */}
        <h3 className="text-sm font-semibold text-white tracking-tight transition-opacity duration-300">
          {stage === 2 ? slowTitle : wakeTitle}
        </h3>
        <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto leading-relaxed transition-opacity duration-300">
          {stage === 2 ? slowSubtext : wakeSubtext}
        </p>

        {/* Subtle loading indicator bar */}
        <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden mx-auto mt-4">
          <div className="h-full w-full bg-gradient-to-r from-violet-500 via-indigo-400 to-violet-500 rounded-full animate-pulse" />
        </div>
      </GlassPanel>
    </div>
  );
}

/**
 * Reusable alias for explicit cold-start API loading states
 */
export function ApiLoadingState(props) {
  return <LoadingState isColdStartAware={true} {...props} />;
}
