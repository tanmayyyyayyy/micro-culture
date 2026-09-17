import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import GlassPanel from "../components/ui/GlassPanel.jsx";
import GlowButton from "../components/ui/GlowButton.jsx";
import CultureCard from "../components/ui/CultureCard.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { StreakBadge } from "../components/ui/ParticipationBadge.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [cultures, setCultures] = useState([]);
  const [stats, setStats] = useState(null);
  const [bestStreak, setBestStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      // Single endpoint — no N+1 queries (B1 fix)
      const { data } = await api.get("/cultures/dashboard");
      const loaded = data.cultures || [];
      setCultures(loaded);
      setStats(data.stats || null);
      // Best current streak across all joined cultures (no extra request)
      const best = loaded.reduce((max, c) => {
        const s = c.participation?.currentStreak || 0;
        return s > max ? s : max;
      }, 0);
      setBestStreak(best);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load your culture sanctuary.");
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
      {/* Welcome Banner, Spotlight & Stats Ribbon */}
      <GlassPanel className="p-6 sm:p-8 relative overflow-hidden border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.name || "there"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-lg">
              Here are the communities you&apos;re part of. Do today&apos;s activity and add your reflection to the community memory.
            </p>
          </div>

          {/* Quick CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Link to="/create" className="w-full sm:w-auto">
              <GlowButton variant="glow" size="md" className="w-full sm:w-auto justify-center min-h-[44px]">
                + Create Community
              </GlowButton>
            </Link>
            <Link to="/explore" className="w-full sm:w-auto">
              <GlowButton variant="secondary" size="md" className="w-full sm:w-auto justify-center min-h-[44px]">
                Explore More
              </GlowButton>
            </Link>
          </div>
        </div>

        {/* Today's Activity Spotlight */}
        {spotlightCulture && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-neutral-900/80 border border-violet-500/20 relative overflow-hidden">
            <div
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ backgroundColor: spotlightCulture.color || "#8b5cf6" }}
            />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="font-semibold text-violet-400 text-xs">
                    Today&apos;s Activity
                  </span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-neutral-200 font-medium">
                    {spotlightCulture.symbol} {spotlightCulture.name}
                  </span>
                  {isSpotlightCompleted && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      ✓ Completed Today
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  {spotlightCulture.rituals?.[0] || "Take part in today's activity and contribute your reflection"}
                </h3>

                <p className="text-xs text-neutral-400 max-w-xl line-clamp-1">
                  {spotlightCulture.description}
                </p>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <Link to={`/cultures/${spotlightCulture._id}/ritual`} className="block w-full sm:w-auto">
                  <GlowButton
                    variant={isSpotlightCompleted ? "secondary" : "glow"}
                    size="md"
                    className="w-full sm:w-auto justify-center min-h-[44px]"
                  >
                    {isSpotlightCompleted ? "Review Activity →" : "Start Today's Activity →"}
                  </GlowButton>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Ribbon */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/5">
            <div className="p-3 sm:p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors duration-200 animate-slideUp stagger-1">
              <div className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider truncate">
                Communities Joined
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {stats.totalJoined ?? cultures.length}
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors duration-200 animate-slideUp stagger-2">
              <div className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider truncate">
                Founded by You
              </div>
              <div className="text-2xl font-bold text-violet-400 mt-1">
                {stats.totalCreated ?? 0}
              </div>
            </div>

            <div className={`p-3 sm:p-3.5 rounded-xl border hover:border-opacity-60 transition-colors duration-200 animate-slideUp stagger-3 ${bestStreak > 0 ? "bg-amber-950/20 border-amber-500/30" : "bg-neutral-900/60 border-neutral-800/80"}`}>
              <div className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider truncate">
                Best Active Streak
              </div>
              <div className={`text-2xl font-bold mt-1 flex items-center gap-1.5 ${bestStreak > 0 ? "text-amber-400" : "text-neutral-400"}`}>
                <span>{bestStreak > 0 ? "🔥" : "⚡"}</span> {bestStreak}
                <span className="text-xs font-normal text-neutral-400/70">days</span>
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors duration-200 flex flex-col justify-between animate-slideUp stagger-4">
              <div className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider truncate">
                Community Memory
              </div>
              <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active &amp; Adapting
              </div>
            </div>
          </div>
        )}
      </GlassPanel>

      {/* Cultures Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Your Communities
          </h2>
          <span className="text-xs text-neutral-500 font-mono">
            {cultures.length} total
          </span>
        </div>

        {loading ? (
          <LoadingState message="Loading your communities..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadDashboard} />
        ) : cultures.length === 0 ? (
          <EmptyState
            icon="🌌"
            title="You haven't joined any communities yet"
            description="Browse communities to find one that interests you, or create your own."
            action={
              <div className="flex items-center gap-3">
                <Link to="/explore">
                  <GlowButton variant="glow" size="md">
                    Explore Communities
                  </GlowButton>
                </Link>
                <Link to="/create">
                  <GlowButton variant="secondary" size="md">
                    Create Community
                  </GlowButton>
                </Link>
              </div>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
            {cultures.map((c) => (
              <CultureCard
                key={c._id}
                culture={c}
                isMember={true}
                actionText="Today's Activity"
                actionLink={`/cultures/${c._id}/ritual`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
