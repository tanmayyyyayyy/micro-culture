import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client.js";
import GlassPanel from "../components/ui/GlassPanel.jsx";
import GlowButton from "../components/ui/GlowButton.jsx";
import CultureEmblem from "../components/ui/CultureEmblem.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import { StreakCompletion } from "../components/ui/ParticipationBadge.jsx";

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
  const [participation, setParticipation] = useState(null);

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

      // Check if the user already completed today's ritual (prevents stale
      // form showing after page refresh when the user already submitted)
      if (ritualRes.data?._id && cultureRes.data?.participation?.lastCompletedAt) {
        const lastDate = new Date(cultureRes.data.participation.lastCompletedAt)
          .toISOString()
          .slice(0, 10);
        const today = new Date().toISOString().slice(0, 10);
        if (lastDate === today) {
          setCompleted(true);
          setParticipation(cultureRes.data.participation);
        }
      }
    } catch (err) {
      setError(
        err.response?.status === 403
          ? "You must be a member of this community to access today's activity."
          : err.response?.data?.error || "Failed to load today's activity."
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
      // Fetch updated participation data (streak + recognition) for this member.
      // /cultures/:id now returns `participation` when the caller is authenticated.
      try {
        const { data } = await api.get(`/cultures/${id}`);
        if (data.participation) setParticipation(data.participation);
      } catch (_) { /* streak is bonus info — don't block completion UI */ }
    } catch (err) {
      // 409 = already completed today — treat as success, not error
      if (err.response?.status === 409) {
        setCompleted(true);
        try {
          const { data } = await api.get(`/cultures/${id}`);
          if (data.participation) setParticipation(data.participation);
        } catch (_) { /* best effort */ }
      } else {
        setError(err.response?.data?.error || "Failed to consecrate your reflection.");
      }
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <LoadingState
          message="Loading today's activity..."
          subtext="AI is preparing your community's daily activity."
        />
      </div>
    );
  }

  if (error && !ritual) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Activity Unavailable"
          message={error}
          onRetry={loadData}
        />
        <div className="mt-4 text-center">
          <Link
            to={`/cultures/${id}`}
            className="text-xs text-neutral-400 hover:text-white underline"
          >
            ← Back to Community
          </Link>
        </div>
      </div>
    );
  }

  if (!ritual) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <p className="text-neutral-400">No activity recorded for today.</p>
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
              Today&apos;s Activity
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            to={`/cultures/${id}/feed`}
            className="text-xs px-3.5 py-2 min-h-[38px] rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
          >
            <span>📋</span> View Feed
          </Link>
        </div>
      </div>

      {/* Main Ritual Card */}
      <GlassPanel className="p-4 sm:p-8 relative overflow-hidden border-violet-500/20 shadow-2xl">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-violet-400">
              Today&apos;s Activity
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Created for:{" "}
              <Link to={`/cultures/${id}`} className="text-neutral-200 font-medium hover:underline">
                {culture?.name || "Community"}
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-xs font-mono text-neutral-500">
              {ritual.date}
            </span>
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
          {hasStructured ? ritual.title : "Today's Activity"}
        </h1>

        {/* What to do */}
        <div className="mb-6 space-y-1.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            What to do
          </div>
          <p className="text-base text-neutral-300 leading-relaxed">
            {hasStructured ? ritual.description : ritual.ritualText}
          </p>
        </div>

        {/* Why this activity? (AI Memory) */}
        {ritual.reason && (
          <div className="mb-8 p-4 rounded-xl bg-violet-950/25 border border-violet-500/25 relative">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-300 uppercase tracking-wider mb-1">
              <span>✦</span> Why this activity? (AI Memory)
            </div>
            <p className="text-xs sm:text-sm text-violet-200/90 leading-relaxed">
              {ritual.reason}
            </p>
          </div>
        )}

        {/* Instructions */}
        {ritual.instructions?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <span>Steps</span>
              <span className="text-[10px] text-neutral-500 font-normal">
                (Click a step to mark it done)
              </span>
            </h3>
            <div className="space-y-2">
              {ritual.instructions.map((step, idx) => {
                const isDone = !!completedSteps[idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleStep(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ease-out flex items-start gap-3 cursor-pointer group/step ${
                      isDone
                        ? "bg-violet-950/25 border-violet-500/30 text-neutral-300"
                        : "bg-neutral-900/50 border-neutral-800/70 text-neutral-200 hover:border-neutral-700 hover:bg-neutral-900/80"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold transition-all duration-200 ease-out ${
                        isDone
                          ? "bg-violet-600 border-violet-500 text-white shadow-sm shadow-violet-500/20"
                          : "border-neutral-700 bg-neutral-800/60 text-transparent group-hover/step:border-neutral-500"
                      }`}
                    >
                      ✓
                    </div>
                    <span className={`text-sm leading-relaxed transition-colors duration-200 ${isDone ? "line-through text-neutral-500" : ""}`}>
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
              Reflection
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
              <div className="flex items-start justify-between gap-2">
                <label className="block text-xs sm:text-sm font-medium text-neutral-200 flex-1">
                  Share your reflection to save it in the community memory
                </label>
                <span className="text-xs text-neutral-500 flex-shrink-0 pt-0.5 font-mono">
                  {content.length}/2000
                </span>
              </div>

              <textarea
                placeholder="Describe how you did today's activity, what you noticed, or how it felt..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={2000}
                rows={4}
                className="w-full px-4 py-3 bg-neutral-900/90 border border-neutral-700/60 rounded-xl text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/40 focus:bg-neutral-900 transition-all duration-200 resize-none leading-relaxed"
              />

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <p className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                  <span className="text-violet-400">✦</span>
                  Your reflection helps AI create better activities for your community.
                </p>

                <GlowButton
                  type="submit"
                  variant="glow"
                  loading={posting}
                  disabled={posting || !content.trim()}
                  className="w-full sm:w-auto justify-center min-h-[44px]"
                >
                  {posting ? "Saving..." : "Complete Activity"}
                </GlowButton>
              </div>
            </form>
          ) : (
            <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-emerald-950/30 to-neutral-900/90 border border-emerald-500/25 text-center space-y-4 shadow-2xl shadow-emerald-500/10 animate-scaleIn">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400 text-2xl mx-auto shadow-lg shadow-emerald-500/10">
                ✓
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  Activity Complete
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Done!</h3>
                <p className="text-sm text-emerald-300">
                  Your reflection has been saved to the community memory.
                </p>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Your community&apos;s past activities help AI create better activities tomorrow.
                </p>
              </div>

              {/* Streak + Recognition banner */}
              <StreakCompletion participation={participation} />

              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2 w-full max-w-sm sm:max-w-none mx-auto">
                <Link to={`/cultures/${id}/feed`} className="w-full sm:w-auto">
                  <GlowButton size="md" variant="glow" className="w-full sm:w-auto justify-center min-h-[44px]">
                    View in Feed →
                  </GlowButton>
                </Link>
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <GlowButton size="md" variant="secondary" className="w-full sm:w-auto justify-center min-h-[44px]">
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
