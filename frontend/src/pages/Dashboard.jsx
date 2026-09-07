import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [cultures, setCultures] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      setError("");
      try {
        // Single endpoint — no N+1 queries (B1 fix)
        const { data } = await api.get("/cultures/dashboard");
        setCultures(data.cultures || []);
        setStats(data.stats || null);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load your cultures");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Your cultures</h1>
      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : cultures.length === 0 ? (
        <p className="text-neutral-500">
          You haven&apos;t joined any cultures yet.{" "}
          <Link to="/explore" className="underline">Explore</Link> or{" "}
          <Link to="/create" className="underline">create one</Link>.
        </p>
      ) : (
        <>
          {stats && (
            <p className="text-sm text-neutral-500 mb-4">
              {stats.totalJoined} joined · {stats.totalCreated} created
            </p>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            {cultures.map((c) => (
              <Link
                key={c._id}
                to={`/cultures/${c._id}`}
                className="p-4 border border-neutral-800 rounded-lg hover:border-neutral-600"
              >
                <div className="flex items-center gap-2">
                  <span>{c.symbol}</span>
                  <h2 className="font-medium">{c.name}</h2>
                </div>
                <p className="text-sm text-neutral-400 mt-1 line-clamp-2">{c.description}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
