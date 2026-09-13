import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import GlassPanel from "../components/ui/GlassPanel.jsx";
import GlowButton from "../components/ui/GlowButton.jsx";
import CultureEmblem from "../components/ui/CultureEmblem.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import WeeklySummaryModal from "../components/WeeklySummaryModal.jsx";
import { ProgressionPanel } from "../components/ui/ProgressionBadge.jsx";
import { StreakCard } from "../components/ui/ParticipationBadge.jsx";

export default function CultureDetail() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const [culture, setCulture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDesc, setEditDesc] = useState("");
  const [editSymbol, setEditSymbol] = useState("");

  async function loadCulture() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/cultures/${id}`);
      setCulture(data);
      setEditDesc(data.description || "");
      setEditSymbol(data.symbol || "✨");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load culture charter.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCulture();
  }, [id]);

  useEffect(() => {
    if (!showEditModal) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") setShowEditModal(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showEditModal]);

  async function handleJoin() {
    setActionLoading(true);
    setError("");
    try {
      await api.post(`/cultures/${id}/join`);
      await Promise.all([loadCulture(), refreshUser()]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to join culture.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLeave() {
    if (!window.confirm("Are you certain you wish to depart from this culture?")) return;
    setActionLoading(true);
    setError("");
    try {
      await api.post(`/cultures/${id}/leave`);
      await Promise.all([loadCulture(), refreshUser()]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to leave culture.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.put(`/cultures/${id}`, {
        description: editDesc,
        symbol: editSymbol,
      });
      setCulture((prev) => ({ ...prev, ...res.data }));
      setShowEditModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update culture.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <LoadingState message="Loading community..." />
      </div>
    );
  }

  if (error && !culture) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState message={error} onRetry={loadCulture} />
      </div>
    );
  }

  if (!culture) return null;

  const currentUserId = (user?.id || user?._id)?.toString();
  const isCreator = culture.creatorId?.toString() === currentUserId;
  const isMember =
    user &&
    (culture.members?.some((m) => (m?._id || m)?.toString() === currentUserId) || isCreator);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <GlassPanel className="p-6 sm:p-10 relative overflow-hidden border-white/10 shadow-2xl">
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: culture.color || "#8b5cf6" }}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <CultureEmblem
              symbol={culture.symbol}
              color={culture.color}
              size="xl"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {culture.name}
                </h1>
                {isMember && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {isCreator ? "Founder" : "Member"}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 flex items-center gap-3">
                <span>{culture.membersCount ?? (culture.members?.length || 1)} Dedicated Members</span>
                <span>·</span>
                <span>Active Living Culture</span>
              </p>
            </div>
          </div>

          {/* Primary Action Button based on membership state */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {user && !isMember ? (
              <GlowButton
                variant="glow"
                size="lg"
                loading={actionLoading}
                onClick={handleJoin}
                className="w-full sm:w-auto"
              >
                Join Culture
              </GlowButton>
            ) : isMember ? (
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <Link to={`/cultures/${id}/ritual`} className="w-full sm:w-auto">
                  <GlowButton variant="glow" size="md" className="w-full sm:w-auto">
                    Today&apos;s Activity →
                  </GlowButton>
                </Link>
                <Link to={`/cultures/${id}/feed`} className="w-full sm:w-auto">
                  <GlowButton variant="secondary" size="md" className="w-full sm:w-auto">
                    Community Feed
                  </GlowButton>
                </Link>
              </div>
            ) : (
              <Link to="/signup">
                <GlowButton variant="glow" size="md">
                  Sign up to Join
                </GlowButton>
              </Link>
            )}
          </div>
        </div>

        {/* Culture Description */}
        <p className="mt-6 text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
          {culture.description}
        </p>

        {/* Vibe Tags */}
        {culture.vibeWords?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {culture.vibeWords.map((v, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-full bg-neutral-900/80 border border-neutral-700/60 text-neutral-300"
              >
                #{v}
              </span>
            ))}
          </div>
        )}

        {/* Secondary Member Bar */}
        {isMember && (
          <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
            {/* Personal participation: streak + recognition */}
            {culture.participation && (
              <StreakCard participation={culture.participation} />
            )}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowSummaryModal(true)}
                className="inline-flex items-center gap-1.5 text-violet-400 hover:text-violet-300 transition-colors"
              >
                <span>📜</span> Weekly Summary
              </button>
              {isCreator && (
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  ✎ Edit Community
                </button>
              )}
            </div>

            {!isCreator && (
              <button
                type="button"
                onClick={handleLeave}
                disabled={actionLoading}
                className="text-red-400/80 hover:text-red-300 transition-colors"
              >
                Leave culture
              </button>
            )}
            </div>
          </div>
        )}
      </GlassPanel>

      {/* Visitor Onboarding Explainer if not member */}
      {!isMember && (
        <GlassPanel className="p-6 bg-violet-950/20 border-violet-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-semibold text-violet-300">
              What happens when you join?
            </h3>
            <p className="text-xs text-neutral-400 max-w-xl">
              You join the daily activity, share reflections, and help shape what the community does next. AI learns from everyone&apos;s contributions.
            </p>
          </div>
          {user ? (
            <GlowButton size="sm" variant="glow" onClick={handleJoin} loading={actionLoading}>
              Join Now
            </GlowButton>
          ) : (
            <Link to="/signup">
              <GlowButton size="sm" variant="glow">
                Sign Up
              </GlowButton>
            </Link>
          )}
        </GlassPanel>
      )}

      {/* Culture Evolution / Progression */}
      {culture.progression && (
        <ProgressionPanel progression={culture.progression} />
      )}

      {/* Three Pillars Charter Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Core Values */}
        <GlassPanel className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <span>✦</span> Values
            </div>
            <ul className="space-y-2.5 text-sm">
              {culture.values?.length > 0 ? (
                culture.values.map((v, i) => (
                  <li key={i} className="flex items-center gap-2 text-neutral-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    <span>{v}</span>
                  </li>
                ))
              ) : (
                <li className="text-neutral-500 text-xs">No explicit values cataloged.</li>
              )}
            </ul>
          </div>
        </GlassPanel>

        {/* Aesthetic Direction */}
        <GlassPanel className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <span>✧</span> Vibe
            </div>
            <ul className="space-y-2.5 text-sm">
              {culture.aesthetic?.length > 0 ? (
                culture.aesthetic.map((a, i) => (
                  <li key={i} className="flex items-center gap-2 text-neutral-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{a}</span>
                  </li>
                ))
              ) : (
                <li className="text-neutral-500 text-xs">Aesthetic is purely emergent.</li>
              )}
            </ul>
          </div>
        </GlassPanel>

        {/* Culture Memory Status */}
        <GlassPanel className="p-6 flex flex-col justify-between bg-neutral-900/60 border-amber-500/20">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <span>★</span> Memory
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              Your activity logs are used by AI to create better daily activities for your community.
            </p>
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 flex items-center gap-2">
              <span className="animate-pulse">●</span>
              <span>Memory Active &amp; Evolving</span>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Lexicon / Jargon Dictionary */}
      {culture.jargon?.length > 0 && (
        <GlassPanel className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <span>📖</span> Community Words
            </h2>
            <span className="text-xs text-neutral-500">
              {culture.jargon.length} terms
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {culture.jargon.map((term, i) => {
              const [word, def] = term.includes(":") ? term.split(/:(.+)/) : [term, ""];
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col justify-between"
                >
                  <span className="font-semibold text-sm text-violet-300 tracking-wide font-mono">
                    {word.trim()}
                  </span>
                  {def && (
                    <span className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      {def.trim()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </GlassPanel>
      )}

      {/* Starter & Active Rituals */}
      {culture.activeRituals?.length > 0 && (
        <GlassPanel className="p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300 mb-4 flex items-center gap-2">
            <span>🕯</span> Traditions
          </h2>
          <div className="space-y-2.5">
            {culture.activeRituals.map((r) => (
              <div
                key={r._id}
                className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/60 text-sm text-neutral-300 flex items-center gap-3"
              >
                <span className="text-neutral-500">·</span>
                <span>{r.text}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* Weekly Summary Modal */}
      <WeeklySummaryModal
        cultureId={id}
        cultureName={culture.name}
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
      />

      {/* Founder Edit Modal */}
      {showEditModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowEditModal(false)}
        >
          <GlassPanel
            className="max-w-md w-full max-h-[85vh] overflow-y-auto p-6 bg-neutral-900 border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white mb-4">Edit Community</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Culture Symbol (Emoji)
                </label>
                <input
                  value={editSymbol}
                  onChange={(e) => setEditSymbol(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <GlowButton
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </GlowButton>
                <GlowButton
                  type="submit"
                  size="sm"
                  variant="glow"
                  loading={actionLoading}
                >
                  Save Changes
                </GlowButton>
              </div>
            </form>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
