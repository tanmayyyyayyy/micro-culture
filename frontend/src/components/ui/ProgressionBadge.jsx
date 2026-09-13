/**
 * ProgressionBadge — inline stage chip for CultureCard / small contexts
 * ProgressionPanel — full Culture Evolution section for CultureDetail
 *
 * Both are derived from the same glassmorphic design system.
 * All data comes from the server-side `progression` object — no client state.
 */

const STAGE_META = {
  SEED: {
    level: 1,
    color: "#6b7280",          // gray-500
    glow:  "rgba(107,114,128,0.4)",
    description: "A new culture awakens. The first seeds of ritual are being planted.",
    nextTarget: "Get a few members and complete your first rites.",
    icon: "🌱",
  },
  AWAKENING: {
    level: 2,
    color: "#8b5cf6",          // violet-500
    glow:  "rgba(139,92,246,0.4)",
    description: "Your culture is beginning to develop its own rhythm.",
    nextTarget: "Keep completing rites to establish your cultural heartbeat.",
    icon: "✨",
  },
  GROWING: {
    level: 3,
    color: "#06b6d4",          // cyan-500
    glow:  "rgba(6,182,212,0.4)",
    description: "The culture is finding its voice — members are shaping shared memory.",
    nextTarget: "Invite more members and consecrate more rites.",
    icon: "🌿",
  },
  ESTABLISHED: {
    level: 4,
    color: "#f59e0b",          // amber-500
    glow:  "rgba(245,158,11,0.4)",
    description: "A living culture with real traditions and collective wisdom.",
    nextTarget: "Continue the rituals — your culture has real momentum now.",
    icon: "🔥",
  },
  THRIVING: {
    level: 5,
    color: "#10b981",          // emerald-500
    glow:  "rgba(16,185,129,0.4)",
    description: "A thriving culture with deep memory and legendary rituals.",
    nextTarget: "Your culture is in full bloom. Keep the rites alive.",
    icon: "⚡",
  },
};

// ---------------------------------------------------------------------------
// ProgressionBadge — compact chip used in CultureCard / Dashboard
// ---------------------------------------------------------------------------
export function ProgressionBadge({ progression }) {
  if (!progression) return null;
  const meta = STAGE_META[progression.stage] || STAGE_META.SEED;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.2rem 0.6rem",
        borderRadius: "999px",
        fontSize: "0.65rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        border: `1px solid ${meta.color}55`,
        background: `${meta.color}18`,
        color: meta.color,
      }}
    >
      {meta.icon} {progression.stage}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ProgressionBar — animating fill bar, used in both panels
// ---------------------------------------------------------------------------
function ProgressBar({ progress, color, glow }) {
  return (
    <div
      style={{
        height: "6px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.07)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          borderRadius: "999px",
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          boxShadow: `0 0 8px ${glow}`,
          /* CSS animation — runs once on mount, ~600ms ease-out */
          animation: "progressFill 0.7s cubic-bezier(0.22,0.61,0.36,1) both",
          transformOrigin: "left center",
        }}
      />
      <style>{`
        @keyframes progressFill {
          from { width: 0%; }
          to   { width: ${progress}%; }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProgressionPanel — full section for CultureDetail
// ---------------------------------------------------------------------------
export function ProgressionPanel({ progression }) {
  if (!progression) return null;
  const meta  = STAGE_META[progression.stage] || STAGE_META.SEED;
  const level = progression.level ?? meta.level;

  return (
    <section
      style={{
        padding: "1.5rem",
        borderRadius: "1rem",
        border: `1px solid ${meta.color}33`,
        background: `radial-gradient(ellipse at top left, ${meta.color}12 0%, transparent 70%), rgba(255,255,255,0.04)`,
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow orb */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          background: meta.glow,
          filter: "blur(50px)",
          pointerEvents: "none",
          opacity: 0.5,
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", position: "relative" }}>
        <div>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "0.3rem" }}>
            CULTURE EVOLUTION
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.4rem" }}>{meta.icon}</span>
            <span style={{ fontSize: "1.15rem", fontWeight: 800, color: meta.color, letterSpacing: "0.06em" }}>
              {progression.stage}
            </span>
          </div>
        </div>
        {/* Level pips */}
        <div style={{ display: "flex", gap: "0.3rem" }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: n <= level ? meta.color : "rgba(255,255,255,0.12)",
                boxShadow: n <= level ? `0 0 6px ${meta.glow}` : "none",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", marginBottom: "1rem", lineHeight: 1.55 }}>
        "{meta.description}"
      </p>

      {/* Progress bar */}
      <div style={{ marginBottom: "0.6rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
          <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Stage Progress
          </span>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: meta.color }}>
            {progression.progress}%
          </span>
        </div>
        <ProgressBar progress={progression.progress} color={meta.color} glow={meta.glow} />
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
        <div>
          <p style={{ fontSize: "1rem", fontWeight: 800, color: "#fff", margin: 0 }}>{progression.completedRituals ?? 0}</p>
          <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Activities Completed</p>
        </div>
        <div>
          <p style={{ fontSize: "1rem", fontWeight: 800, color: "#fff", margin: 0 }}>{progression.members ?? 0}</p>
          <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Members</p>
        </div>
        {progression.level < 5 && (
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <p style={{ fontSize: "0.68rem", color: meta.color, margin: 0, letterSpacing: "0.06em" }}>Next level →</p>
            <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>Level {level + 1}</p>
          </div>
        )}
      </div>
    </section>
  );
}
