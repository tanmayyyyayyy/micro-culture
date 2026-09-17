import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client.js";
import GlowButton from "../components/ui/GlowButton.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import { StreakCompletion } from "../components/ui/ParticipationBadge.jsx";

const COMMUNITY_COLORS = {
  gateverse:           { primary: "#F5A623", bg: "#FFF8E7" },
  "java junction":     { primary: "#E8775A", bg: "#FFF1EC" },
  "pixel playground":  { primary: "#C77DFF", bg: "#F8F0FF" },
  blockbuilders:       { primary: "#5B8DEF", bg: "#EEF3FF" },
  "cyber sentinels":   { primary: "#2EC4B6", bg: "#E8FAFA" },
  hacknights:          { primary: "#FF6B9D", bg: "#FFF0F6" },
  "dsa dojo":          { primary: "#818CF8", bg: "#F0F0FF" },
  codecanvas:          { primary: "#F59E0B", bg: "#FFFBEB" },
  "neural nest":       { primary: "#A855F7", bg: "#F9F0FF" },
  "open source orbit": { primary: "#10B981", bg: "#ECFDF5" },
  codesprint:          { primary: "#EF4444", bg: "#FFF1F1" },
  "career launchpad":  { primary: "#F97316", bg: "#FFF7ED" },
  "devops dock":       { primary: "#06B6D4", bg: "#ECFEFF" },
  "project playground":{ primary: "#EC4899", bg: "#FFF0F7" },
  "boundary club":     { primary: "#10B981", bg: "#ECFDF5" },
  "lo-fi lounge":      { primary: "#F472B6", bg: "#FDF2F8" },
  "the reading room":  { primary: "#F59E0B", bg: "#FFFBEB" },
  "frame by frame":    { primary: "#06B6D4", bg: "#ECFEFF" },
  "game night":        { primary: "#8B5CF6", bg: "#F5F3FF" },
  "wander notes":      { primary: "#14B8A6", bg: "#F0FDFA" },
  "movie circle":      { primary: "#E11D48", bg: "#FFF1F2" },
  "art corner":        { primary: "#FB923C", bg: "#FFF7ED" },
};

function getCommunityColors(name = "", fallback = "#7C3AED") {
  const key = name.toLowerCase().trim();
  if (COMMUNITY_COLORS[key]) return COMMUNITY_COLORS[key];
  for (const [k, v] of Object.entries(COMMUNITY_COLORS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return { primary: fallback, bg: "#F8F7FF" };
}

const difficultyConfig = {
  easy:   { bg: "#ECFDF5", color: "#065F46", label: "Easy" },
  medium: { bg: "#FFFBEB", color: "#92400E", label: "Medium" },
  hard:   { bg: "#FFF1F2", color: "#9F1239", label: "Hard" },
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
  const colors = getCommunityColors(culture?.name, culture?.color);
  const completedCount = (ritual.instructions || []).filter((_, idx) => !!completedSteps[idx]).length;
  const totalCount = ritual.instructions?.length || 0;
  const diffConf = difficultyConfig[ritual.difficulty] || difficultyConfig.easy;

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fadeIn">

      {/* ══════════════════════════════════════════
          TOP NAV
      ══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={`/cultures/${id}`}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-transform hover:scale-105"
            style={{ background: colors.bg, border: `2px solid ${colors.primary}35` }}
          >
            {culture?.symbol || "✨"}
          </Link>
          <div>
            <Link
              to={`/cultures/${id}`}
              className="text-xs font-semibold transition-colors hover:opacity-70"
              style={{ color: colors.primary }}
            >
              ← Back to {culture?.name || "Community"}
            </Link>
            <h2 className="text-base font-extrabold" style={{ color: "#1A1A2E" }}>
              Your activity for today
            </h2>
          </div>
        </div>

        <Link
          to={`/cultures/${id}`}
          className="text-xs px-4 py-2 min-h-[38px] rounded-full font-semibold flex items-center justify-center gap-1.5 w-full sm:w-auto transition-all"
          style={{
            background: "#fff",
            border: "1.5px solid rgba(26,26,46,0.12)",
            color: "#4B5563",
          }}
        >
          💬 Club Discussions
        </Link>
      </div>

      {/* ══════════════════════════════════════════
          MAIN ACTIVITY CARD
      ══════════════════════════════════════════ */}
      <div
        className="warm-card p-6 sm:p-8 relative overflow-hidden"
        style={{ border: `1.5px solid ${colors.primary}30` }}
      >
        {/* Top color band */}
        <div
          className="absolute top-0 left-0 right-0 h-2 rounded-t-3xl"
          style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.primary}60)` }}
        />

        {/* Decorative blob */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: colors.primary, filter: "blur(60px)", opacity: 0.18 }}
          aria-hidden="true"
        />

        <div className="relative z-10 space-y-6 pt-2">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: colors.bg, color: colors.primary }}
            >
              Daily activity
            </span>
            {ritual.durationMinutes && (
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: "rgba(26,26,46,0.06)", color: "#4B5563" }}
              >
                ⏱ ~{ritual.durationMinutes} min
              </span>
            )}
            {ritual.difficulty && (
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full capitalize"
                style={{ background: diffConf.bg, color: diffConf.color }}
              >
                {diffConf.label}
              </span>
            )}
            <span className="text-[11px] font-medium ml-auto" style={{ color: "#94A3B8" }}>
              {ritual.date}
            </span>
          </div>

          {/* Title */}
          <div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold leading-tight"
              style={{ color: "#1A1A2E" }}
            >
              {hasStructured ? ritual.title : "Today's Activity"}
            </h1>
            <p className="text-sm sm:text-base leading-relaxed mt-2" style={{ color: "#4B5563" }}>
              {hasStructured ? ritual.description : ritual.ritualText}
            </p>
          </div>

          {/* Interactive steps */}
          {ritual.instructions?.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold" style={{ color: "#1A1A2E" }}>
                  Steps
                </h3>
                <span className="text-xs font-semibold" style={{ color: colors.primary }}>
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
                      className="w-full text-left p-3.5 rounded-2xl flex items-start gap-3 transition-all cursor-pointer"
                      style={{
                        background: isDone ? `${colors.primary}12` : "rgba(26,26,46,0.03)",
                        border: `1.5px solid ${isDone ? colors.primary + "40" : "rgba(26,26,46,0.08)"}`,
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-all"
                        style={{
                          background: isDone ? colors.primary : "#fff",
                          border: `1.5px solid ${isDone ? colors.primary : "rgba(26,26,46,0.15)"}`,
                          color: isDone ? "#fff" : "#94A3B8",
                        }}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <span
                        className={`text-sm leading-relaxed ${isDone ? "line-through opacity-60" : ""}`}
                        style={{ color: isDone ? "#64748B" : "#1A1A2E" }}
                      >
                        {step}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Why this activity */}
          {ritual.reason && (
            <div
              className="p-4 rounded-2xl"
              style={{ background: `${colors.primary}0D`, border: `1.5px solid ${colors.primary}25` }}
            >
              <div className="text-xs font-bold mb-1" style={{ color: colors.primary }}>
                💡 Why this activity today?
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#4B5563" }}>
                {ritual.reason}
              </p>
            </div>
          )}

          {/* Reflection prompt */}
          {ritual.reflectionPrompt && (
            <div
              className="p-5 rounded-2xl"
              style={{ background: "rgba(26,26,46,0.03)", border: "1.5px solid rgba(26,26,46,0.08)" }}
            >
              <div className="text-xs font-bold mb-2" style={{ color: "#1A1A2E" }}>
                💭 Reflection prompt
              </div>
              <blockquote
                className="text-sm sm:text-base italic leading-relaxed"
                style={{ color: "#374151", borderLeft: `3px solid ${colors.primary}`, paddingLeft: "12px" }}
              >
                "{ritual.reflectionPrompt}"
              </blockquote>
            </div>
          )}

          {/* Reflection form / completion */}
          <div
            className="pt-4"
            style={{ borderTop: "1.5px solid rgba(26,26,46,0.08)" }}
          >
            {completed ? (
              <div className="space-y-4 text-center">
                <div
                  className="p-6 rounded-3xl"
                  style={{
                    background: `linear-gradient(135deg, ${colors.bg} 0%, #fff 100%)`,
                    border: `1.5px solid ${colors.primary}30`,
                  }}
                >
                  <div className="text-5xl mb-3">🎉</div>
                  <h3 className="text-xl font-extrabold mb-1" style={{ color: "#1A1A2E" }}>
                    Activity done!
                  </h3>
                  <p className="text-sm" style={{ color: "#64748B" }}>
                    Nice work. Your reflection is now part of {culture?.name}'s community memory.
                  </p>

                  {participation && (
                    <div className="pt-3 max-w-sm mx-auto">
                      <StreakCompletion participation={participation} />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                    <Link to={`/cultures/${id}`}>
                      <GlowButton variant="glow" size="md">
                        Go to discussions →
                      </GlowButton>
                    </Link>
                    <Link to="/dashboard">
                      <GlowButton variant="secondary" size="md">
                        Back to home
                      </GlowButton>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePostReflection} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold" style={{ color: "#1A1A2E" }}>
                    ✍️ Your reflection
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share a short note on what you tried, learned, or questioned..."
                    rows={4}
                    maxLength={2000}
                    className="w-full px-4 py-3.5 rounded-2xl text-sm resize-none leading-relaxed focus:outline-none transition-all"
                    style={{
                      background: "#fff",
                      border: "1.5px solid rgba(26,26,46,0.12)",
                      color: "#1A1A2E",
                    }}
                    onFocus={(e) => {
                      e.target.style.border = `1.5px solid ${colors.primary}60`;
                      e.target.style.boxShadow = `0 0 0 3px ${colors.primary}18`;
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "1.5px solid rgba(26,26,46,0.12)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                {error && <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs" style={{ color: "#94A3B8" }}>
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
    </div>
  );
}
