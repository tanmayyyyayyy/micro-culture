import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client.js";
import GlassPanel from "../components/ui/GlassPanel.jsx";
import GlowButton from "../components/ui/GlowButton.jsx";
import CultureEmblem from "../components/ui/CultureEmblem.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";

export default function DailyRitualPage() {
  const { id } = useParams();
  const [culture, setCulture] = useState(null);
  const [ritual, setRitual] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({});

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      // Parallel load: culture charter info + today's ritual
      const [cultureRes, ritualRes] = await Promise.all([
        api.get(`/cultures/${id}`),
        api.get(`/ai/daily-ritual/${id}`),
      ]);
      setCulture(cultureRes.data);
      setRitual(ritualRes.data);
    } catch (err) {
      setError(
        err.response?.status === 403
          ? "You must be a member of this culture to partake in today's sacred ritual."
          : err.response?.data?.error || "Failed to summon today's ritual."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  function toggleStep(index) {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }

  async function handlePostReflection(e) {
    e.preventDefault();
    if (!content.trim() || posting || completed) return;
    setPosting(true);
    setError("");
    try {
      // Send ritualId alongside content (B6 fix — closes the culture memory loop)
      await api.post("/logs", {
        cultureId: id,
        ritualId: ritual?._id,
        content: content.trim(),
      });
      setCompleted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to consecrate your reflection.");
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <LoadingState
          message="Consulting the cultural memory..."
          subtext="Synthesizing today's ritual from member lore and communal momentum."
        />
      </div>
    );
  }

  if (error && !ritual) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Rite Unavailable"
          message={error}
          onRetry={loadData}
        />
        <div className="mt-4 text-center">
          <Link
            to={`/cultures/${id}`}
            className="text-xs text-neutral-400 hover:text-white underline"
          >
            ← Return to Culture Charter
          </Link>
        </div>
      </div>
    );
  }

  if (!ritual) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <p className="text-neutral-400">No ritual recorded for today.</p>
        <Link to={`/cultures/${id}`} className="mt-4 inline-block text-xs text-violet-400 underline">
          Back to culture
        </Link>
      </div>
    );
  }

  const hasStructured = ritual.title && ritual.description;
  const difficultyColors = {
    easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    hard: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <CultureEmblem
            symbol={culture?.symbol || "✨"}
            color={culture?.color || "#8b5cf6"}
            size="sm"
          />
          <div>
            <Link
              to={`/cultures/${id}`}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              {culture?.name || "Culture"}
            </Link>
            <h2 className="text-sm font-semibold text-neutral-200">
              Today&apos;s Communal Rite
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/cultures/${id}/feed`}
            className="text-xs px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-all flex items-center gap-1.5"
          >
            <span>📜</span> View Communal Feed
          </Link>
        </div>
      </div>

      {/* Main Ritual Card */}
      <GlassPanel className="p-6 sm:p-8 relative overflow-hidden border-violet-500/20 shadow-2xl">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Today&apos;s Rite
            </span>
            <span className="text-xs font-mono text-neutral-400">
              {ritual.date}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {ritual.durationMinutes && (
              <span className="px-2.5 py-1 rounded-full bg-neutral-800/80 text-neutral-300 border border-neutral-700/60">
                ⏱ ~{ritual.durationMinutes} min
              </span>
            )}
            {ritual.difficulty && (
              <span
                className={`px-2.5 py-1 rounded-full border capitalize font-medium ${
                  difficultyColors[ritual.difficulty] || difficultyColors.easy
                }`}
              >
                {ritual.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3 leading-snug">
          {hasStructured ? ritual.title : "Today's Sacred Rite"}
        </h1>

        {/* Description */}
        <p className="text-base text-neutral-300 leading-relaxed mb-6">
          {hasStructured ? ritual.description : ritual.ritualText}
        </p>

        {/* "Why this rite?" Rationale (Culture Memory differentiator) */}
        {ritual.reason && (
          <div className="mb-8 p-4 rounded-xl bg-violet-950/25 border border-violet-500/25 relative">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-300 uppercase tracking-wider mb-1">
              <span>✦</span> Why this rite? (Culture Memory)
            </div>
            <p className="text-xs sm:text-sm text-violet-200/90 leading-relaxed">
              {ritual.reason}
            </p>
          </div>
        )}

        {/* Instructions */}
        {ritual.instructions?.length > 0 && (
          <div className="mb-8 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <span>Sacred Steps</span>
              <span className="text-[10px] text-neutral-500 font-normal">
                (Click step to mark as completed)
              </span>
            </h3>
            <div className="space-y-2.5">
              {ritual.instructions.map((step, idx) => {
                const isDone = !!completedSteps[idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleStep(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isDone
                        ? "bg-violet-950/20 border-violet-500/30 text-neutral-300"
                        : "bg-neutral-900/50 border-neutral-800/80 text-neutral-200 hover:border-neutral-700"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold transition-all ${
                        isDone
                          ? "bg-violet-600 border-violet-500 text-white shadow-sm"
                          : "border-neutral-700 bg-neutral-800/60 text-transparent hover:border-neutral-500"
                      }`}
                    >
                      ✓
                    </div>
                    <span className={`text-sm leading-relaxed ${isDone ? "line-through text-neutral-400" : ""}`}>
                      {step}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reflection prompt */}
        {ritual.reflectionPrompt && (
          <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 mb-8">
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              Reflection Inquiry
            </div>
            <p className="text-sm italic text-neutral-200 leading-relaxed">
              &ldquo;{ritual.reflectionPrompt}&rdquo;
            </p>
          </div>
        )}

        {/* Completion & Reflection Form */}
        <div className="pt-6 border-t border-white/10">
          {!completed ? (
            <form onSubmit={handlePostReflection} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-neutral-200">
                  Seal today&apos;s rite in the culture&apos;s memory
                </label>
                <span className="text-xs text-neutral-500">
                  {content.length}/2000
                </span>
              </div>

              <textarea
                placeholder="Describe how you observed today's rite, what insights arose, or how it felt..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={2000}
                rows={4}
                className="w-full px-4 py-3 bg-neutral-900/90 border border-neutral-700/80 rounded-xl text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none"
              />

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <p className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                  <span className="text-violet-400">✦</span>
                  Your reflection actively guides the AI in crafting future rites.
                </p>

                <GlowButton
                  type="submit"
                  variant="glow"
                  loading={posting}
                  disabled={posting || !content.trim()}
                >
                  {posting ? "Sealing in Memory..." : "Complete & Consecrate"}
                </GlowButton>
              </div>
            </form>
          ) : (
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl mx-auto shadow-lg shadow-emerald-500/10">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Rite Complete</h3>
                <p className="text-sm text-emerald-300 mt-1">
                  Your reflection has become part of the culture&apos;s memory.
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  The communal memory loop will incorporate your experience into upcoming rites.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Link to={`/cultures/${id}/feed`}>
                  <GlowButton size="sm" variant="glow">
                    View in Culture Feed →
                  </GlowButton>
                </Link>
                <Link to="/dashboard">
                  <GlowButton size="sm" variant="secondary">
                    Back to Dashboard
                  </GlowButton>
                </Link>
              </div>
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
