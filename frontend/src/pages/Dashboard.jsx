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
      setError(err.response?.data?.error || "Failed to load your student dashboard.");
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header: Friendly Student Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Hey {user?.name?.split(" ")[0] || "there"} 👋</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-300">
            Here&apos;s what&apos;s happening across your communities today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/create">
            <GlowButton variant="glow" size="sm" className="min-h-[40px]">
              + Start Club
            </GlowButton>
          </Link>
          <Link to="/explore">
            <GlowButton variant="secondary" size="sm" className="min-h-[40px]">
              Find More Clubs
            </GlowButton>
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
              <GlowButton variant="glow" size="md">
                Explore Student Clubs →
              </GlowButton>
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {/* 2. SECTION 1: TODAY'S ACTIVITY (FOCAL POINT) */}
          {spotlightCulture && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚡</span> Today&apos;s Activity
                </span>
                {isSpotlightCompleted && (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span>✓</span> All done for today
                  </span>
                )}
              </div>

              <div
                className="playful-card p-6 sm:p-7 relative overflow-hidden border border-white/10"
                style={{
                  "--card-accent-glow": `${spotlightCulture.color || "#8b5cf6"}35`,
                }}
              >
                <div
                  className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
                  style={{ backgroundColor: spotlightCulture.color || "#8b5cf6" }}
                />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span className="font-bold text-violet-300">
                        {spotlightCulture.symbol} {spotlightCulture.name}
                      </span>
                      <span className="text-neutral-500">•</span>
                      <span className="text-neutral-400">15 min daily practice</span>
                      {isSpotlightCompleted && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          ✓ Completed
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
                      {spotlightCulture.rituals?.[0] || "Take part in today's activity and contribute your reflection"}
                    </h3>

                    <p className="text-xs text-neutral-300 max-w-2xl line-clamp-2">
                      {spotlightCulture.description}
                    </p>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    <Link to={`/cultures/${spotlightCulture._id}/ritual`} className="block w-full sm:w-auto">
                      <GlowButton
                        variant={isSpotlightCompleted ? "secondary" : "glow"}
                        size="md"
                        className="w-full sm:w-auto justify-center min-h-[46px]"
                      >
                        {isSpotlightCompleted ? "Review Activity →" : "Start Today's Activity →"}
                      </GlowButton>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. SECTION 2: YOUR COMMUNITIES */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-bold text-white uppercase tracking-wider">
                Your Communities ({cultures.length})
              </span>
              <Link to="/explore" className="text-violet-400 hover:text-violet-300 font-semibold">
                Explore More →
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cultures.map((c) => (
                <CultureCard
                  key={c._id}
                  culture={c}
                  isMember={true}
                  actionText="Open Club"
                  actionLink={`/cultures/${c._id}`}
                />
              ))}
            </div>
          </div>

          {/* 4. SECTION 3: RECENT DISCUSSIONS */}
          {recentDiscussions.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>💬</span> Recent Discussions in Your Clubs
                </span>
                <span className="text-neutral-500">Live replies &amp; doubts</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {recentDiscussions.map((d) => {
                  const authorName = typeof d.userId === "object" ? d.userId?.name : "Student";
                  const clubName = typeof d.cultureId === "object" ? d.cultureId?.name : "Club";
                  const clubSymbol = typeof d.cultureId === "object" ? d.cultureId?.symbol : "✨";
                  const clubId = typeof d.cultureId === "object" ? d.cultureId?._id : d.cultureId;

                  return (
                    <Link
                      key={d._id}
                      to={`/cultures/${clubId}`}
                      className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 hover:border-violet-500/40 transition-all space-y-2 group block"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-violet-300 flex items-center gap-1">
                          <span>{clubSymbol}</span> {clubName}
                        </span>
                        <span className="text-neutral-500 text-[11px]">
                          {formatTimeAgo(d.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-200 line-clamp-2 leading-relaxed group-hover:text-white">
                        &ldquo;{d.content}&rdquo;
                      </p>

                      <div className="text-[11px] text-neutral-400 font-medium flex items-center justify-between pt-1">
                        <span>— {authorName}</span>
                        <span className="text-violet-400 group-hover:translate-x-0.5 transition-all">Reply →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. SECTION 4: YOUR PROGRESS */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Your Progress
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-neutral-900/70 border border-white/10 hover:border-amber-500/30 transition-all">
                <div className="text-xs font-semibold text-neutral-400">
                  Active Streak
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1 flex items-center gap-1">
                  <span>🔥</span> {bestStreak} <span className="text-xs font-normal text-neutral-400">{bestStreak === 1 ? "day" : "days"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/70 border border-white/10 hover:border-violet-500/30 transition-all">
                <div className="text-xs font-semibold text-neutral-400">
                  Clubs Joined
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-violet-300 mt-1">
                  {stats?.totalJoined ?? cultures.length}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/70 border border-white/10 hover:border-cyan-500/30 transition-all">
                <div className="text-xs font-semibold text-neutral-400">
                  Clubs Founded
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 mt-1">
                  {stats?.totalCreated ?? 0}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/70 border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="text-xs font-semibold text-neutral-400">
                  Community Memory
                </div>
                <div className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Active &amp; Adapting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
