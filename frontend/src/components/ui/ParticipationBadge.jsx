/**
 * ParticipationBadge.jsx
 *
 * Lightweight components for displaying ritual streaks + recognition.
 * Styled inline to match the existing glassmorphic design system.
 * All values must come from the server-derived `participation` object — never
 * from localStorage or invented client state.
 *
 * Exports:
 *   StreakBadge        — compact flame chip (for CultureCard, NavBar area)
 *   StreakCard         — medium info block (for CultureDetail member bar)
 *   StreakCompletion   — post-completion banner shown in DailyRitualPage
 *   RecognitionBadge   — earned title chip
 */

// ---------------------------------------------------------------------------
// Milestone definitions
// ---------------------------------------------------------------------------
const MILESTONES = [3, 7, 14, 30];

function getMilestone(streak) {
  return MILESTONES.find((m) => streak === m) || null;
}

const MILESTONE_COPY = {
  3:  "Three days of devotion. Your practice is taking root.",
  7:  "A full week of rites. Rhythm is becoming ritual.",
  14: "Fourteen days of dedication. You are shaping this culture.",
  30: "Thirty days of consecration. You are a living legend of this culture.",
};

const RECOGNITION_META = {
  INITIATE:      { icon: "🌱", color: "#8b5cf6" },
  PRACTITIONER:  { icon: "🔥", color: "#f59e0b" },
  RITUAL_KEEPER: { icon: "⚡", color: "#10b981" },
};

// ---------------------------------------------------------------------------
// StreakBadge — compact chip, used in CultureCard / Dashboard stats ribbon
// ---------------------------------------------------------------------------
export function StreakBadge({ participation }) {
  if (!participation || participation.currentStreak < 1) return null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.2rem 0.55rem",
        borderRadius: "999px",
        fontSize: "0.65rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        background: "rgba(245,158,11,0.12)",
        border: "1px solid rgba(245,158,11,0.3)",
        color: "#f59e0b",
      }}
    >
      🔥 {participation.currentStreak}d streak
    </span>
  );
}

// ---------------------------------------------------------------------------
// RecognitionBadge — earned title chip (Initiate / Practitioner / Ritual Keeper)
// ---------------------------------------------------------------------------
export function RecognitionBadge({ recognition }) {
  if (!recognition) return null;
  const meta = RECOGNITION_META[recognition.key] || RECOGNITION_META.INITIATE;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.2rem 0.55rem",
        borderRadius: "999px",
        fontSize: "0.65rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        background: `${meta.color}18`,
        border: `1px solid ${meta.color}44`,
        color: meta.color,
      }}
    >
      {meta.icon} {recognition.title}
    </span>
  );
}

// ---------------------------------------------------------------------------
// StreakCard — compact member participation block, used in CultureDetail
// ---------------------------------------------------------------------------
export function StreakCard({ participation }) {
  if (!participation) return null;

  const { currentStreak, longestStreak, recognition } = participation;

  return (
    <div
      className="flex flex-wrap items-center gap-3 sm:gap-5 p-3 sm:p-4 rounded-2xl"
      style={{
        background: "rgba(245,158,11,0.08)",
        border: "1.5px solid rgba(245,158,11,0.22)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "#d97706", margin: 0, lineHeight: 1 }}>
          {currentStreak}
        </p>
        <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#92400e", margin: 0, fontWeight: 700, marginTop: "0.25rem" }}>
          Day Streak
        </p>
      </div>

      <div style={{ width: "1px", height: "28px", background: "rgba(26,26,46,0.1)" }} />

      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1A1A2E", margin: 0, lineHeight: 1 }}>
          {longestStreak}
        </p>
        <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B", margin: 0, fontWeight: 700, marginTop: "0.25rem" }}>
          Personal Best
        </p>
      </div>

      {recognition && (
        <>
          <div className="hidden sm:block" style={{ width: "1px", height: "28px", background: "rgba(26,26,46,0.1)" }} />
          <RecognitionBadge recognition={recognition} />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StreakCompletion — post-completion card, shown in DailyRitualPage
// ---------------------------------------------------------------------------
export function StreakCompletion({ participation }) {
  if (!participation || participation.currentStreak < 1) return null;

  const { currentStreak, longestStreak, recognition } = participation;
  const milestone = getMilestone(currentStreak);

  return (
    <div
      style={{
        marginTop: "0.75rem",
        padding: "1rem 1.25rem",
        borderRadius: "1rem",
        background: "rgba(245,158,11,0.08)",
        border: "1.5px solid rgba(245,158,11,0.25)",
        textAlign: "center",
      }}
    >
      {/* Streak headline */}
      <p
        style={{
          fontSize: "1.05rem",
          fontWeight: 800,
          color: "#d97706",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        🔥 {currentStreak} Day Streak
      </p>

      {/* Milestone callout */}
      {milestone ? (
        <p style={{ fontSize: "0.85rem", color: "#92400e", marginTop: "0.4rem", lineHeight: 1.5, fontWeight: 500 }}>
          {MILESTONE_COPY[milestone]}
        </p>
      ) : (
        <p style={{ fontSize: "0.8rem", color: "#78350f", marginTop: "0.4rem" }}>
          Your practice is becoming a tradition.
        </p>
      )}

      {/* Personal best + recognition row */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.75rem",
          marginTop: "0.6rem",
          flexWrap: "wrap",
        }}
      >
        {longestStreak > currentStreak && (
          <span style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 600 }}>
            Personal best: {longestStreak} days
          </span>
        )}
        {recognition && <RecognitionBadge recognition={recognition} />}
      </div>
    </div>
  );
}
