import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client.js";
import GlowButton from "../components/ui/GlowButton.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import { StreakCompletion } from "../components/ui/ParticipationBadge.jsx";

const difficultyColors = {
  easy: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  hard: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

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
      const [cultureRes, ritualRes] = await Promise.all([
        api.get(`/cultures/${id}`),
        api.get(`/ai/daily-ritual/${id}`),
      ]);
      setCulture(cultureRes.data);
      setRitual(ritualRes.data);

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
      await api.post("/logs", {
        cultureId: id,
        ritualId: ritual?._id,
        content: content.trim(),
      });
      setCompleted(true);
      try {
        const { data } = await api.get(`/cultures/${id}`);
        if (data.participation) setParticipation(data.participation);
      } catch (_) { /* streak is bonus */ }
    } catch (err) {
      if (err.response?.status === 409) {
        setCompleted(true);
        try {
          const { data } = await api.get(`/cultures/${id}`);
          if (data.participation) setParticipation(data.participation);
        } catch (_) { /* best effort */ }
      } else {
        setError(err.response?.data?.error || "Failed to save your reflection.");
      }
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <LoadingState
          message="Preparing today's activity..."
          subtext="Fetching today's practice and community prompt."
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
      </div>
    );
  }

  if (!ritual) return null;

  const hasStructured = Boolean(ritual.title && ritual.instructions?.length);
  const accentColor = culture?.color || "#8b5cf6";
  const completedCount = (ritual.instructions || []).filter((_, idx) => !!completedSteps[idx]).length;
  const totalCount = ritual.instructions?.length || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Friendly Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link
            to={`/cultures/${id}`}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-white/10"
            style={{ backgroundColor: `${accentColor}25` }}
          >
            {culture?.symbol || "✨"}
          </Link>
          <div>
            <Link
              to={`/cultures/${id}`}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              ← Back to {culture?.name || "Community"}
            </Link>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Your activity for today</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 font-semibold">
                Daily Task
              </span>
            </h2>
          </div>
        </div>

        <Link
          to={`/cultures/${id}`}
          className="text-xs px-3.5 py-2 min-h-[38px] rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
        >
          <span>💬</span> Club Discussions
        </Link>
      </div>

      {/* Main Friendly Activity Card */}
      <div
        className="playful-card p-6 sm:p-8 relative overflow-hidden border border-white/10"
        style={{ "--card-accent-glow": `${accentColor}30` }}
      >
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-15"
          style={{ backgroundColor: accentColor }}
        />

        {/* Activity Meta Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 pb-3 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-violet-400">
              Today&apos;s thing to do
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-xs text-neutral-300 font-medium">
              {culture?.name}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            {ritual.durationMinutes && (
              <span className="px-2.5 py-1 rounded-full bg-neutral-800/90 text-neutral-300 border border-neutral-700/60 font-semibold text-[11px]">
                ⏱ ~{ritual.durationMinutes} min
              </span>
            )}
            {ritual.difficulty && (
              <span
                className={`px-2.5 py-1 rounded-full border capitalize font-semibold text-[11px] ${
                  difficultyColors[ritual.difficulty] || difficultyColors.easy
                }`}
              >
                {ritual.difficulty}
              </span>
            )}
            <span className="text-[11px] font-mono text-neutral-400">
              {ritual.date}
            </span>
          </div>
        </div>

        {/* Big Friendly Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3 leading-snug relative z-10">
          {hasStructured ? ritual.title : "Today's Activity"}
        </h1>

        {/* Short Goal/Description */}
        <p className="text-sm sm:text-base text-neutral-200 leading-relaxed mb-6 relative z-10">
          {hasStructured ? ritual.description : ritual.ritualText}
        </p>

        {/* Interactive Steps Checklist */}
        {ritual.instructions?.length > 0 && (
          <div className="space-y-3 mb-8 relative z-10">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <span>📋</span> Simple Steps
              </h3>
              <span className="text-xs font-bold text-violet-300">
                {completedCount} of {totalCount} done
              </span>
            </div>

            <div className="space-y-2">
              {ritual.instructions.map((step, idx) => {
                const isDone = !!completedSteps[idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleStep(idx)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 group cursor-pointer ${
                      isDone
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-100 shadow-sm"
                        : "bg-neutral-900/70 border-white/5 text-neutral-200 hover:border-white/15 hover:bg-neutral-900/90"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border text-xs font-bold transition-all ${
                        isDone
                          ? "bg-emerald-500 border-emerald-400 text-neutral-950 scale-105"
                          : "border-neutral-600 bg-neutral-800/80 text-neutral-400 group-hover:border-violet-400"
                      }`}
                    >
                      {isDone ? "✓" : idx + 1}
                    </div>
                    <span className={`text-sm leading-relaxed ${isDone ? "line-through opacity-75" : ""}`}>
                      {step}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Context & Reason */}
        {ritual.reason && (
          <div className="mb-8 p-4 rounded-2xl bg-violet-950/25 border border-violet-500/20 relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300 mb-1">
              <span>💡</span> Why this activity today?
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {ritual.reason}
            </p>
          </div>
        )}

        {/* Editorial Reflection Prompt Callout */}
        {ritual.reflectionPrompt && (
          <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/10 mb-8 relative z-10">
            <div className="text-xs font-bold text-violet-300 mb-2 flex items-center gap-1.5">
              <span>💭</span> Today&apos;s Reflection Prompt
            </div>
            <blockquote className="text-sm sm:text-base italic text-white leading-relaxed border-l-3 border-violet-500 pl-3.5">
              &ldquo;{ritual.reflectionPrompt}&rdquo;
            </blockquote>
          </div>
        )}

        {/* Reflection Form / Completion Banner */}
        <div className="pt-2 border-t border-white/5 relative z-10">
          {completed ? (
            <div className="space-y-4 py-4 text-center">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-violet-950/20 to-neutral-900/80 border border-emerald-500/30 space-y-3">
                <div className="text-4xl">🎉</div>
                <h3 className="text-xl font-extrabold text-white">
                  Activity Complete!
                </h3>
                <p className="text-xs text-neutral-300 max-w-md mx-auto">
                  You did today&apos;s activity for {culture?.name}. Your reflection is now part of the community memory!
                </p>

                {participation && (
                  <div className="pt-2 max-w-sm mx-auto">
                    <StreakCompletion participation={participation} />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                  <Link to={`/cultures/${id}`}>
                    <GlowButton variant="glow" size="md">
                      Go to Club Discussions →
                    </GlowButton>
                  </Link>
                  <Link to="/dashboard">
                    <GlowButton variant="secondary" size="md">
                      Back to Dashboard
                    </GlowButton>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePostReflection} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <span>✍️</span> Your Reflection
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share a short note on what you tried, learned, or questioned while doing this activity..."
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-3.5 bg-neutral-900/90 border border-white/10 rounded-2xl text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition-all resize-none leading-relaxed"
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <p className="text-xs text-neutral-400">
                  Your reflection shapes future activities for everyone in {culture?.name}.
                </p>

                <GlowButton
                  type="submit"
                  variant="glow"
                  size="md"
                  loading={posting}
                  disabled={!content.trim()}
                  className="min-h-[44px] px-6 justify-center"
                >
                  Complete Activity 🎉
                </GlowButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
