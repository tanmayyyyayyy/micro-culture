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
              Communal Memory Feed
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GlowButton
            size="sm"
            variant="secondary"
            onClick={() => setShowSummaryModal(true)}
          >
            Weekly Chronicle
          </GlowButton>
          <Link to={`/cultures/${id}/ritual`}>
            <GlowButton size="sm" variant="glow">
              Today&apos;s Rite →
            </GlowButton>
          </Link>
        </div>
      </div>

      {/* Memory Signal Callout */}
      <GlassPanel className="p-4 bg-violet-950/20 border-violet-500/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-violet-400 text-lg">✦</span>
          <div>
            <h4 className="text-xs font-semibold text-violet-300">
              Your Culture Remembers
            </h4>
            <p className="text-[11px] text-neutral-400">
              Every reflection logged below is passed into the AI prompt memory context when tomorrow&apos;s daily rite is generated.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-neutral-400 flex-shrink-0">
          {logs.length} logs
        </span>
      </GlassPanel>

      {/* Main Feed Content */}
      {loading ? (
        <LoadingState
          message="Retrieving sacred chronicles..."
          subtext="Loading member reflections from MongoDB"
        />
      ) : error ? (
        <ErrorState message={error} onRetry={loadFeed} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon="🕯️"
          title="No reflections recorded yet"
          description="Be the first to partake in today's rite and leave a reflection for the culture's evolving memory."
          action={
            <Link to={`/cultures/${id}/ritual`}>
              <GlowButton variant="glow" size="md">
                Partake in Today&apos;s Rite
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
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600/30 to-indigo-600/30 border border-violet-500/30 text-violet-300 font-bold text-xs flex items-center justify-center shadow-inner">
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
                      Rite: {log.ritualId.title}
                    </span>
                  )}
                </div>

                {/* Reflection Content */}
                <p className="text-sm text-neutral-200 leading-relaxed pl-11 whitespace-pre-wrap">
                  {log.content}
                </p>

                {log.imageUrl && (
                  <div className="pl-11 pt-2">
                    <img
                      src={log.imageUrl}
                      alt="Ritual artifact"
                      className="rounded-xl max-h-72 object-cover border border-white/10"
                    />
                  </div>
                )}

                {/* Memory Badge */}
                <div className="pl-11 pt-2 border-t border-white/5 flex items-center gap-2 text-[10px] text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span>Enshrined in cultural memory</span>
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
