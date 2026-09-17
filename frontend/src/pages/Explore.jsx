import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import CultureCard from "../components/ui/CultureCard.jsx";
import GlowButton from "../components/ui/GlowButton.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

const STUDENT_CATEGORIES = [
  { id: "all",      label: "All",       emoji: "🌟" },
  { id: "study",    label: "Study",     emoji: "📚" },
  { id: "code",     label: "Code",      emoji: "💻" },
  { id: "design",   label: "Design",    emoji: "🎨" },
  { id: "ai",       label: "AI",        emoji: "🧠" },
  { id: "security", label: "Security",  emoji: "🛡️" },
  { id: "build",    label: "Build",     emoji: "🚀" },
  { id: "career",   label: "Career",    emoji: "🎯" },
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

  const popularCultures = cultures
    .filter((c) => c.discovery?.isTrending || c.discovery?.isActive || (c.members?.length || 0) >= 4)
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* ══════════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════════ */}
      <div className="space-y-4 max-w-2xl">
        <h1
          className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight"
          style={{ color: "#1A1A2E" }}
        >
          Find your people.
        </h1>
        <p className="text-base sm:text-lg leading-relaxed" style={{ color: "#64748B" }}>
          Learn, build, discuss and grow with communities that match what you're into.
        </p>
      </div>

      {/* ══════════════════════════════════════════
          SEARCH + CREATE
      ══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <svg
            className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "#94A3B8" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search communities..."
            className="w-full pl-11 pr-5 py-3 rounded-full text-sm font-medium focus:outline-none transition-all duration-200"
            style={{
              background: "#fff",
              border: "1.5px solid rgba(26,26,46,0.12)",
              boxShadow: "0 2px 8px rgba(26,26,46,0.06)",
              color: "#1A1A2E",
            }}
            onFocus={(e) => {
              e.target.style.border = "1.5px solid rgba(124,58,237,0.4)";
              e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1.5px solid rgba(26,26,46,0.12)";
              e.target.style.boxShadow = "0 2px 8px rgba(26,26,46,0.06)";
            }}
          />
        </form>
        <Link to="/create" className="w-full sm:w-auto">
          <GlowButton variant="glow" size="md" className="w-full sm:w-auto justify-center">
            + Start a Club
          </GlowButton>
        </Link>
      </div>

      {/* ══════════════════════════════════════════
          CATEGORY PILLS
      ══════════════════════════════════════════ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STUDENT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleFilterClick(cat.id)}
            className={`pill-btn shrink-0 ${activeFilter === cat.id ? "active" : ""}`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          POPULAR RIGHT NOW
      ══════════════════════════════════════════ */}
      {!q.trim() && activeFilter === "all" && popularCultures.length > 0 && !loading && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🔥</span>
            <span className="text-sm font-bold" style={{ color: "#1A1A2E" }}>
              Popular right now
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {popularCultures.map((pop) => {
              const color = pop.color || "#7C3AED";
              return (
                <Link
                  key={pop._id}
                  to={`/cultures/${pop._id}`}
                  className="warm-card p-4 flex items-center justify-between gap-3 hover:scale-[1.01] transition-transform"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="text-2xl w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${color}18`, border: `1.5px solid ${color}30` }}
                    >
                      {pop.symbol || "✨"}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold truncate" style={{ color: "#1A1A2E" }}>
                        {pop.name}
                      </h4>
                      <p className="text-[11px] font-medium" style={{ color: "#94A3B8" }}>
                        {pop.membersCount ?? (pop.members?.length || 1)} members
                      </p>
                    </div>
                  </div>
                  <span className="text-lg shrink-0">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          COMMUNITIES GRID
      ══════════════════════════════════════════ */}
      {loading ? (
        <LoadingState message="Finding communities..." subtext="Connecting you with clubs, prep circles, and builders." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadCultures(q, activeFilter)} />
      ) : cultures.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No communities found"
          description="Try a different topic or create your own club!"
          action={
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <GlowButton
                size="sm"
                variant="secondary"
                onClick={() => {
                  setQ("");
                  setActiveFilter("all");
                  loadCultures("", "all");
                }}
              >
                Show all
              </GlowButton>
              <Link to="/create">
                <GlowButton size="sm" variant="glow">+ Start a Community</GlowButton>
              </Link>
            </div>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: "#64748B" }}>
              {cultures.length} {cultures.length === 1 ? "community" : "communities"}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
            {cultures.map((c) => (
              <CultureCard
                key={c._id}
                culture={c}
                actionText="Open"
                actionLink={`/cultures/${c._id}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
