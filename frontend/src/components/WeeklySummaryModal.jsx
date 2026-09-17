import { useState, useEffect } from "react";
import api from "../api/client.js";
import GlowButton from "./ui/GlowButton.jsx";
import GlassPanel from "./ui/GlassPanel.jsx";

export default function WeeklySummaryModal({ cultureId, cultureName, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !cultureId) return;

    let mounted = true;
    async function fetchSummary() {
      setLoading(true);
      setError("");
      try {
        const res = await api.post("/ai/weekly-summary", { cultureId });
        if (mounted) {
          setData(res.data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.status === 403
              ? "Only culture members can view weekly summaries."
              : err.response?.data?.error || "Failed to generate weekly summary."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchSummary();
    return () => {
      mounted = false;
    };
  }, [isOpen, cultureId]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeInFast"
      onClick={onClose}
    >
      <GlassPanel
        className="max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 sm:p-8 bg-white border border-neutral-200/80 shadow-2xl relative animate-scaleIn rounded-3xl text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 text-neutral-400 hover:text-neutral-900 transition-colors duration-150 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-neutral-100"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-2 text-violet-600 text-xs font-bold uppercase tracking-wider mb-2">
          <span>✧</span> Weekly Summary
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-1">
          {cultureName} — This Week
        </h2>
        <p className="text-xs text-neutral-500 mb-6">
          Here&apos;s what happened in your community this week, based on member activity and reflections.
        </p>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-neutral-700 font-medium">Generating your weekly summary...</p>
            <p className="text-xs text-neutral-500 mt-1">Reading member activity and reflections</p>
          </div>
        ) : error ? (
          <div className="py-6 text-center">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <GlowButton size="sm" variant="secondary" onClick={onClose}>
              Close
            </GlowButton>
          </div>
        ) : data ? (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-violet-50/80 border border-violet-200/80">
              <h4 className="text-xs font-bold text-violet-800 uppercase tracking-wider mb-2">
                Community Highlights
              </h4>
              <p className="text-sm text-neutral-800 leading-relaxed">{data.summary}</p>
            </div>

            {data.ritualOfTheWeek && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80">
                <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
                  <span>★</span> Top Activity This Week
                </div>
                <blockquote className="text-sm italic text-neutral-900 mb-2 border-l-3 border-amber-400 pl-3 my-2 font-medium">
                  &ldquo;{data.ritualOfTheWeek.content}&rdquo;
                </blockquote>
                {data.ritualOfTheWeek.reason && (
                  <p className="text-xs text-neutral-600">
                    <span className="text-amber-800 font-bold">Why chosen:</span> {data.ritualOfTheWeek.reason}
                  </p>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <GlowButton size="sm" variant="primary" onClick={onClose}>
                Close
              </GlowButton>
            </div>
          </div>
        ) : null}
      </GlassPanel>
    </div>
  );
}
