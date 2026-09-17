import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import CultureCard from "../components/ui/CultureCard.jsx";
import GlowButton from "../components/ui/GlowButton.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

const DISCOVERY_CATEGORIES = ["all", "trending", "new", "active", "growing"];

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
      setError(err.response?.data?.error || "Failed to discover cultures.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCultures(q, activeFilter);
  }, []);

  function handleFilterClick(filter) {
    setActiveFilter(filter);
    loadCultures(q, filter);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadCultures(q, activeFilter);
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>✧</span> Discover
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Find Your Community
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-md">
            Join a community built around something you care about. Take part in activities and help shape what comes next.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-80">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, values, or vibe..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-neutral-900/90 border border-neutral-700/60 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/40 transition-all duration-200"
            />
            <svg
              className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3 pointer-events-none"
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
              + Create Community
            </GlowButton>
          </Link>
        </div>
      </div>

      {/* Discovery Category Filters — Horizontally scrollable on mobile, wrapping on larger screens */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs sm:flex-wrap">
        <span className="text-neutral-500 mr-1 font-medium whitespace-nowrap">Category:</span>
        {DISCOVERY_CATEGORIES.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => handleFilterClick(filter)}
            className={`whitespace-nowrap px-3.5 py-1.5 min-h-[36px] rounded-full uppercase text-[11px] tracking-wider font-semibold transition-all duration-200 ease-out cursor-pointer ${
              activeFilter === filter
                ? "bg-white text-neutral-950 shadow-sm"
                : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800/80"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Cultures Grid */}
      {loading ? (
        <LoadingState message="Loading communities..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadCultures(q, activeFilter)} />
      ) : cultures.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No communities match your search"
          description="Try a different search term or filter, or create your own community."
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
                Clear Filters
              </GlowButton>
              <Link to="/create">
                <GlowButton size="sm" variant="glow">
                  Create a Community
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
              actionText="View Community"
              actionLink={`/cultures/${c._id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
