import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client.js";
import GlassPanel from "../components/ui/GlassPanel.jsx";
import GlowButton from "../components/ui/GlowButton.jsx";
import CultureEmblem from "../components/ui/CultureEmblem.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import WeeklySummaryModal from "../components/WeeklySummaryModal.jsx";

function formatTimeAgo(dateStr) {
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

export default function CultureFeed() {
  const { id } = useParams();
  const [culture, setCulture] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  async function loadFeed() {
    setLoading(true);
    setError("");
    try {
      const [cultureRes, logsRes] = await Promise.all([
        api.get(`/cultures/${id}`),
        api.get(`/logs/${id}`),
      ]);
      setCulture(cultureRes.data);
      setLogs(logsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load culture feed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <CultureEmblem
            symbol={culture?.symbol || "📜"}
            color={culture?.color || "#8b5cf6"}
            size="sm"
          />
          <div>
            <Link
              to={`/cultures/${id}`}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              {culture?.name || "Culture Charter"}
            </Link>
            <h1 className="text-xl font-bold text-white">
              Community Feed
            </h1>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <GlowButton
            size="sm"
            variant="secondary"
            onClick={() => setShowSummaryModal(true)}
            className="w-full sm:w-auto justify-center min-h-[38px]"
          >
            Weekly Summary
          </GlowButton>
          <Link to={`/cultures/${id}/ritual`} className="w-full sm:w-auto">
            <GlowButton size="sm" variant="glow" className="w-full sm:w-auto justify-center min-h-[38px]">
              Today&apos;s Activity →
            </GlowButton>
          </Link>
        </div>
      </div>

      {/* Memory Signal Callout */}
      <GlassPanel className="p-4 bg-violet-950/20 border-violet-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-violet-400 text-lg shrink-0">✦</span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold text-violet-300">
                Community Memory
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Active
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed">
              Every reflection shared here is saved to the community memory and used by AI when creating future activities.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-neutral-400 shrink-0 self-start sm:self-auto px-2.5 py-1 rounded-md bg-neutral-900/80 border border-neutral-800">
          {logs.length} {logs.length === 1 ? "reflection" : "reflections"} saved
        </span>
      </GlassPanel>

      {/* Main Feed Content */}
      {loading ? (
        <LoadingState
          message="Loading community feed..."
          subtext="Fetching member reflections"
        />
      ) : error ? (
        <ErrorState message={error} onRetry={loadFeed} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon="📘"
          title="No reflections yet"
          description="Be the first to complete today's activity and share your reflection."
          action={
            <Link to={`/cultures/${id}/ritual`}>
              <GlowButton variant="glow" size="md">
                Do Today&apos;s Activity
              </GlowButton>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const memberName = log.userId?.name || "Anonymous Member";
            const initial = memberName.charAt(0).toUpperCase();

            return (
              <GlassPanel key={log._id} className="p-5 sm:p-6 space-y-3">
                {/* Author & Timestamp Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600/30 to-indigo-600/30 border border-violet-500/30 text-violet-300 font-bold text-xs flex items-center justify-center shadow-inner flex-shrink-0">
                      {initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-100">
                        {memberName}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {formatTimeAgo(log.createdAt)}
                      </p>
                    </div>
                  </div>

                  {log.ritualId?.title && (
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 max-w-[200px] truncate">
                      Activity: {log.ritualId.title}
                    </span>
                  )}
                </div>

                {/* Reflection Content */}
                <p className="text-sm text-neutral-200 leading-relaxed sm:pl-11 whitespace-pre-wrap">
                  {log.content}
                </p>

                {log.imageUrl && (
                  <div className="sm:pl-11 pt-2">
                    <img
                      src={log.imageUrl}
                      alt="Ritual artifact"
                      className="rounded-xl max-h-72 object-cover border border-white/10"
                    />
                  </div>
                )}

                {/* Memory Badge */}
                <div className="sm:pl-11 pt-2 border-t border-white/5 flex items-center gap-2 text-[10px] text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span>Saved in community memory</span>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      )}

      {/* Weekly Summary Modal */}
      <WeeklySummaryModal
        cultureId={id}
        cultureName={culture?.name || "Culture"}
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
      />
    </div>
  );
}
