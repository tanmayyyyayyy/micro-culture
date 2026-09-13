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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner & Stats Ribbon */}
      <GlassPanel className="p-6 sm:p-8 relative overflow-hidden border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>✦</span> Communal Sanctuary
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.name || "Seeker"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-lg">
              Here are the living cultures you partake in. Check in on today&apos;s sacred rites and leave reflections in the cultural memory.
            </p>
          </div>

          {/* Quick CTAs */}
          <div className="flex items-center gap-3">
            <Link to="/create">
              <GlowButton variant="glow" size="md">
                + New Culture
              </GlowButton>
            </Link>
            <Link to="/explore">
              <GlowButton variant="secondary" size="md">
                Explore More
              </GlowButton>
            </Link>
          </div>
        </div>

        {/* Stats Ribbon */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mt-6 pt-6 border-t border-white/5">
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors duration-200 animate-slideUp stagger-1">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Joined Cultures
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {stats.totalJoined ?? cultures.length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors duration-200 animate-slideUp stagger-2">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Founded by You
              </div>
              <div className="text-2xl font-bold text-violet-400 mt-1">
                {stats.totalCreated ?? 0}
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border hover:border-opacity-60 transition-colors duration-200 animate-slideUp stagger-3 ${bestStreak > 0 ? "bg-amber-950/20 border-amber-500/30" : "bg-neutral-900/60 border-neutral-800/80"}`}>
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Best Active Streak
              </div>
              <div className={`text-2xl font-bold mt-1 flex items-center gap-1.5 ${bestStreak > 0 ? "text-amber-400" : "text-neutral-400"}`}>
                <span>{bestStreak > 0 ? "🔥" : "⚡"}</span> {bestStreak}
                <span className="text-xs font-normal text-neutral-400/70">days</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors duration-200 flex flex-col justify-between animate-slideUp stagger-4">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Culture Memory Loop
              </div>
              <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active &amp; Listening
              </div>
            </div>
          </div>
        )}
      </GlassPanel>

      {/* Cultures Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Your Active Cultures
          </h2>
          <span className="text-xs text-neutral-500 font-mono">
            {cultures.length} total
          </span>
        </div>

        {loading ? (
          <LoadingState message="Loading your cultural sanctuaries..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadDashboard} />
        ) : cultures.length === 0 ? (
          <EmptyState
            icon="🌌"
            title="You haven't joined any cultures yet"
            description="The world is full of small, evolving cultures. Discover one that speaks to your values or found your own."
            action={
              <div className="flex items-center gap-3">
                <Link to="/explore">
                  <GlowButton variant="glow" size="md">
                    Explore Existing Cultures
                  </GlowButton>
                </Link>
                <Link to="/create">
                  <GlowButton variant="secondary" size="md">
                    Create Culture
                  </GlowButton>
                </Link>
              </div>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cultures.map((c) => (
              <CultureCard
                key={c._id}
                culture={c}
                isMember={true}
                actionText="Today's Rite"
                actionLink={`/cultures/${c._id}/ritual`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
