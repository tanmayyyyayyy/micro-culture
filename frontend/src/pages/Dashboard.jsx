import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import GlowButton from "../components/ui/GlowButton.jsx";
import CultureCard from "../components/ui/CultureCard.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

function formatTimeAgo(dateStr) {
  if (!dateStr) return "recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// Community color identity (same palette as CultureCard)
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

export default function Dashboard() {
  const { user } = useAuth();
  const [cultures, setCultures] = useState([]);
  const [recentDiscussions, setRecentDiscussions] = useState([]);
  const [stats, setStats] = useState(null);
  const [bestStreak, setBestStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/cultures/dashboard");
      const loaded = data.cultures || [];
      setCultures(loaded);
      setRecentDiscussions(data.recentDiscussions || []);
      setStats(data.stats || null);

      const best = loaded.reduce((max, c) => {
        const s = c.participation?.currentStreak || 0;
        return s > max ? s : max;
      }, 0);
      setBestStreak(best);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const isCompletedToday = (c) => {
    if (!c.participation?.lastCompletedAt) return false;
    const lastDay = new Date(c.participation.lastCompletedAt).toISOString().slice(0, 10);
    return lastDay === todayStr;
  };

  const pendingCulture = cultures.find((c) => !isCompletedToday(c) && c.rituals?.[0]);
  const spotlightCulture = pendingCulture || (cultures.length > 0 ? cultures[0] : null);
  const isSpotlightCompleted = spotlightCulture ? isCompletedToday(spotlightCulture) : false;

  const spotlightColors = spotlightCulture
    ? getCommunityColors(spotlightCulture.name, spotlightCulture.color)
    : { primary: "#7C3AED", bg: "#F8F7FF" };

  return (
    <div className="space-y-10 animate-fadeIn">

      {/* ══════════════════════════════════════════
          GREETING HEADER
      ══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1
            className="text-3xl sm:text-4xl font-extrabold leading-tight"
            style={{ color: "#17172B" }}
          >
            Hey {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-base" style={{ color: "#687085" }}>
            Here's what's happening today.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2.5">
          <Link to="/create">
            <button
              className="px-4 py-2 rounded-full text-xs font-extrabold text-white min-h-[40px] flex items-center gap-1.5 transition-all duration-200 hover:opacity-90"
              style={{ background: "#17172B" }}
            >
              + Start club
            </button>
          </Link>
          <Link to="/explore">
            <button
              className="px-4 py-2 rounded-full text-xs font-extrabold text-[#17172B] min-h-[40px] flex items-center gap-1.5 transition-all duration-200 hover:bg-neutral-50"
              style={{ border: "1.5px solid rgba(23,23,43,0.12)", background: "#fff" }}
            >
              Explore →
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading your dashboard..." subtext="Checking today's activities and discussions." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadDashboard} />
      ) : cultures.length === 0 ? (
        <EmptyState
          icon="🎒"
          title="You haven't joined any communities yet"
          description="Find clubs focused on GATE prep, Java, UI/UX, DSA, or hackathons to start your daily streak!"
          action={
            <Link to="/explore">
              <button
                className="px-6 py-3 rounded-full text-sm font-extrabold text-white transition-all hover:opacity-90"
                style={{ background: "#17172B" }}
              >
                Explore communities →
              </button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-10">

          {/* ══════════════════════════════════════════
              1. TODAY'S ACTIVITY — HERO CARD (STRONG PASTEL BG)
          ══════════════════════════════════════════ */}
          {spotlightCulture && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: "#17172B" }}>
                  Today's activity
                </span>
                {isSpotlightCompleted && (
                  <span
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: "#ECFDF5", color: "#065F46" }}
                  >
                    ✓ Done
                  </span>
                )}
              </div>

              <div
                className="warm-card p-6 sm:p-8 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${spotlightColors.bg} 0%, #FFF3EB 60%, ${spotlightColors.primary}30 100%)`,
                  border: `1.5px solid ${spotlightColors.primary}40`,
                }}
              >
                {/* Large decorative organic blobs */}
                <div
                  className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
                  style={{ background: spotlightColors.primary, filter: "blur(50px)", opacity: 0.3 }}
                  aria-hidden="true"
                />
                <div
                  className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full pointer-events-none"
                  style={{ background: "#FFD966", filter: "blur(40px)", opacity: 0.25 }}
                  aria-hidden="true"
                />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1 min-w-0">
                    {/* Community identity */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-xs"
                        style={{
                          background: "#FFFFFF",
                          border: `2px solid ${spotlightColors.primary}40`,
                        }}
                      >
                        {spotlightCulture.symbol || "✨"}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold" style={{ color: "#17172B" }}>
                          {spotlightCulture.name}
                        </div>
                        <div className="text-[11px] font-medium" style={{ color: "#687085" }}>
                          15 min daily practice challenge
                        </div>
                      </div>
                    </div>

                    {/* Activity title */}
                    <h2
                      className="text-xl sm:text-2xl font-extrabold leading-snug"
                      style={{ color: "#17172B" }}
                    >
                      {spotlightCulture.rituals?.[0] || "Take part in today's activity"}
                    </h2>

                    <p className="text-xs sm:text-sm leading-relaxed line-clamp-2" style={{ color: "#4B5563" }}>
                      {spotlightCulture.description}
                    </p>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    <Link to={`/cultures/${spotlightCulture._id}/ritual`} className="block w-full sm:w-auto">
                      <button
                        className="w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-extrabold text-white transition-all duration-200 hover:opacity-95 active:scale-[0.97] shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        style={{ background: "#17172B" }}
                      >
                        <span>{isSpotlightCompleted ? "Review activity" : "Start activity"}</span>
                        <span>→</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              2. YOUR COMMUNITIES (MINI-CARDS)
          ══════════════════════════════════════════ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold" style={{ color: "#17172B" }}>
                Your communities ({cultures.length})
              </h2>
              <Link
                to="/explore"
                className="text-xs font-bold transition-colors hover:opacity-80"
                style={{ color: "#17172B" }}
              >
                Find more →
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cultures.map((c) => (
                <CultureCard
                  key={c._id}
                  culture={c}
                  isMember={true}
                  actionText="Open"
                  actionLink={`/cultures/${c._id}`}
                />
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════
              3. RECENT DISCUSSIONS (SOCIAL CARDS)
          ══════════════════════════════════════════ */}
          {recentDiscussions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold" style={{ color: "#17172B" }}>
                  Recent discussions
                </h2>
                <span className="text-xs" style={{ color: "#687085" }}>
                  What members are talking about
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {recentDiscussions.map((d) => {
                  const authorName = typeof d.userId === "object" ? d.userId?.name : "Member";
                  const clubName = typeof d.cultureId === "object" ? d.cultureId?.name : "Club";
                  const clubSymbol = typeof d.cultureId === "object" ? d.cultureId?.symbol : "✨";
                  const clubId = typeof d.cultureId === "object" ? d.cultureId?._id : d.cultureId;
                  const colors = getCommunityColors(clubName);

                  return (
                    <Link
                      key={d._id}
                      to={`/cultures/${clubId}`}
                      className="warm-card p-4 space-y-2.5 block hover:scale-[1.01] transition-transform"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-base w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: colors.bg }}
                          >
                            {clubSymbol}
                          </span>
                          <span className="text-xs font-bold" style={{ color: "#17172B" }}>
                            {clubName}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium" style={{ color: "#94A3B8" }}>
                          {formatTimeAgo(d.createdAt)}
                        </span>
                      </div>

                      <p
                        className="text-xs leading-relaxed line-clamp-2"
                        style={{ color: "#374151" }}
                      >
                        "{d.content}"
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-semibold" style={{ color: "#687085" }}>
                          — {authorName}
                        </span>
                        <span className="text-xs font-bold flex items-center gap-1" style={{ color: "#17172B" }}>
                          Reply →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              4. YOUR PROGRESS (FRIENDLY CARDS)
          ══════════════════════════════════════════ */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold" style={{ color: "#17172B" }}>
              Your progress
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {/* Streak */}
              <div
                className="warm-card p-4 text-center space-y-1"
                style={{ background: "#FFFBF0", border: "1.5px solid #FFD966" }}
              >
                <div className="text-2xl sm:text-3xl font-extrabold" style={{ color: "#17172B" }}>
                  🔥 {bestStreak}
                </div>
                <div className="text-xs font-semibold" style={{ color: "#687085" }}>
                  Day streak
                </div>
              </div>

              {/* Discussions */}
              <div
                className="warm-card p-4 text-center space-y-1"
                style={{ background: "#F5F0FF", border: "1.5px solid #C9B6FF" }}
              >
                <div className="text-2xl sm:text-3xl font-extrabold" style={{ color: "#17172B" }}>
                  💬 {recentDiscussions.length}
                </div>
                <div className="text-xs font-semibold" style={{ color: "#687085" }}>
                  Discussions
                </div>
              </div>

              {/* Activities */}
              <div
                className="warm-card p-4 text-center space-y-1"
                style={{ background: "#EDFCFA", border: "1.5px solid #9BE7C4" }}
              >
                <div className="text-2xl sm:text-3xl font-extrabold" style={{ color: "#17172B" }}>
                  ✓ {cultures.reduce((sum, c) => sum + (c.participation?.totalPersonalRituals || 0), 0)}
                </div>
                <div className="text-xs font-semibold" style={{ color: "#687085" }}>
                  Activities
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
