import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import CultureCard from "../components/ui/CultureCard.jsx";
import GlowButton from "../components/ui/GlowButton.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

const STUDENT_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "study", label: "Study 📚" },
  { id: "code", label: "Code 💻" },
  { id: "design", label: "Design 🎨" },
  { id: "ai", label: "AI 🧠" },
  { id: "security", label: "Security 🛡️" },
  { id: "build", label: "Build 🚀" },
  { id: "career", label: "Career 🎯" },
];

export default function Explore() {
  const [cultures, setCultures] = useState([]);
  const [q, setQ] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCultures(query = q, filter = activeFilter) {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (query && query.trim()) params.q = query.trim();
      if (filter && filter !== "all") params.filter = filter;

      const { data } = await api.get("/cultures", { params });
      setCultures(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to discover communities.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCultures(q, activeFilter);
  }, []);

  function handleFilterClick(filterId) {
    setActiveFilter(filterId);
    loadCultures(q, filterId);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadCultures(q, activeFilter);
  }

  // Popular right now: top 3 trending or highly active communities
  const popularCultures = cultures
    .filter((c) => c.discovery?.isTrending || c.discovery?.isActive || (c.members?.length || 0) >= 4)
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Friendly Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
            <span>✨</span> Student Communities
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Find your people.
          </h1>
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            Learn, build, discuss and grow with communities that match what you&apos;re into.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-80">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search communities..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-neutral-900/90 border border-neutral-700/60 text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/30 transition-all duration-200"
            />
            <svg
              className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </form>

          <Link to="/create" className="w-full sm:w-auto">
            <GlowButton variant="glow" size="md" className="w-full sm:w-auto justify-center min-h-[44px]">
              + Start a Club
            </GlowButton>
          </Link>
        </div>
      </div>

      {/* Playful Category Filters — Horizontally scrollable on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap">
        {STUDENT_CATEGORIES.map((cat) => {
          const isActive = activeFilter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleFilterClick(cat.id)}
              className={`whitespace-nowrap px-4 py-2 min-h-[40px] rounded-full text-xs font-bold tracking-wide transition-all duration-200 ease-out cursor-pointer ${
                isActive
                  ? "bg-white text-neutral-950 shadow-md scale-105"
                  : "bg-neutral-900/90 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 hover:bg-neutral-800"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Popular Right Now Spotlight (shown on initial view) */}
      {!q.trim() && activeFilter === "all" && popularCultures.length > 0 && !loading && (
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-300 uppercase">
            <span>🔥</span> Popular right now
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {popularCultures.map((pop) => (
              <Link
                key={pop._id}
                to={`/cultures/${pop._id}`}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-neutral-900/90 to-neutral-900/60 border border-white/10 hover:border-violet-500/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    {pop.symbol || "✨"}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-violet-300 truncate">
                      {pop.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {pop.membersCount ?? (pop.members?.length || 1)} members • Active today
                    </p>
                  </div>
                </div>
                <span className="text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all text-sm shrink-0 ml-2">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Communities Grid */}
      {loading ? (
        <LoadingState message="Finding student communities..." subtext="Connecting you with clubs, prep circles, and builders." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadCultures(q, activeFilter)} />
      ) : cultures.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No communities found"
          description="Try a different topic, search keyword, or create your own club for classmates!"
          action={
            <div className="flex items-center gap-3">
              <GlowButton
                size="sm"
                variant="secondary"
                onClick={() => {
                  setQ("");
                  setActiveFilter("all");
                  loadCultures("", "all");
                }}
              >
                Show All Clubs
              </GlowButton>
              <Link to="/create">
                <GlowButton size="sm" variant="glow">
                  + Start a Community
                </GlowButton>
              </Link>
            </div>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Showing {cultures.length} {cultures.length === 1 ? "community" : "communities"}</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
            {cultures.map((c) => (
              <CultureCard
                key={c._id}
                culture={c}
                actionText="Open Club"
                actionLink={`/cultures/${c._id}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
