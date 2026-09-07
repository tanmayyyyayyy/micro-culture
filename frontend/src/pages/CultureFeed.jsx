import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client.js";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function CultureFeed() {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/logs/${id}`);
        setLogs(data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load culture feed");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Culture feed</h1>
        <Link to={`/cultures/${id}/ritual`} className="text-sm underline text-neutral-400">
          Today&apos;s ritual →
        </Link>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : logs.length === 0 ? (
        <p className="text-neutral-500">
          No logs yet.{" "}
          <Link to={`/cultures/${id}/ritual`} className="underline">
            Be the first to complete today&apos;s ritual
          </Link>.
        </p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log._id} className="p-4 border border-neutral-800 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">{log.userId?.name || "member"}</p>
                <p className="text-xs text-neutral-500">{timeAgo(log.createdAt)}</p>
              </div>
              {log.ritualId?.title && (
                <p className="text-xs text-neutral-500 mb-1">
                  Ritual: {log.ritualId.title}
                </p>
              )}
              <p className="text-neutral-300">{log.content}</p>
              {log.imageUrl && (
                <img src={log.imageUrl} alt="" className="mt-2 rounded max-h-64" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
