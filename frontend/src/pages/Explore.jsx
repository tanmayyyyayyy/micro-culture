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
            <span>✧</span> The Microverse
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Explore Micro-Cultures
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-md">
            Discover active communities, browse their sacred charters, and participate in today&apos;s rituals.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-80">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, values, or vibe..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-neutral-900/90 border border-neutral-700/80 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
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

          <Link to="/create">
            <GlowButton variant="glow" size="md" className="w-full sm:w-auto">
              + Found One
            </GlowButton>
          </Link>
        </div>
      </div>

      {/* Discovery Category Filters */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-neutral-500 mr-1 font-medium">Category:</span>
        {DISCOVERY_CATEGORIES.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => handleFilterClick(filter)}
            className={`px-3 py-1 rounded-full uppercase text-[11px] tracking-wider font-semibold transition-all cursor-pointer ${
              activeFilter === filter
                ? "bg-white text-neutral-950 shadow-sm"
                : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Cultures Grid */}
      {loading ? (
        <LoadingState message="Discovering cultural sanctuaries..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadCultures(q, activeFilter)} />
      ) : cultures.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No cultures match your query"
          description="Try exploring another category or search term, or found a new micro-culture."
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
                  Found this Culture
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
              actionText="View Charter"
              actionLink={`/cultures/${c._id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
