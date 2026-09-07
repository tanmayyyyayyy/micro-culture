import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";

export default function Explore() {
  const [cultures, setCultures] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(query = "") {
    setLoading(true);
    const { data } = await api.get("/cultures", { params: query ? { q: query } : {} });
    setCultures(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Explore cultures</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(q);
        }}
        className="mb-6"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or vibe..."
          className="w-full max-w-md px-3 py-2 bg-neutral-900 border border-neutral-700 rounded"
        />
      </form>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : cultures.length === 0 ? (
        <p className="text-neutral-500">No cultures yet. Be the first to create one.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {cultures.map((c) => (
            <Link
              key={c._id}
              to={`/cultures/${c._id}`}
              className="p-4 border border-neutral-800 rounded-lg hover:border-neutral-600"
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{c.symbol}</span>
                <h2 className="font-medium">{c.name}</h2>
              </div>
              <p className="text-sm text-neutral-400 line-clamp-2">{c.description}</p>
              <p className="text-xs text-neutral-500 mt-2">{c.membersCount} members</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
