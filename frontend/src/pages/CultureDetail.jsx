import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function CultureDetail() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const [culture, setCulture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/cultures/${id}`);
      setCulture(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load culture");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleJoin() {
    setActionLoading(true);
    try {
      await api.post(`/cultures/${id}/join`);
      // Refresh both local culture data and user context (B2 fix)
      await Promise.all([load(), refreshUser()]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to join culture");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLeave() {
    setActionLoading(true);
    try {
      await api.post(`/cultures/${id}/leave`);
      // Refresh both local culture data and user context (B2 fix)
      await Promise.all([load(), refreshUser()]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to leave culture");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <p className="text-neutral-500">Loading...</p>;
  if (error && !culture) return <p className="text-red-400">{error}</p>;
  if (!culture) return null;

  const currentUserId = (user?.id || user?._id)?.toString();
  const isCreator = culture.creatorId?.toString() === currentUserId;
  const isMember =
    user &&
    (culture.members?.some((m) => (m?._id || m)?.toString() === currentUserId) || isCreator);

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{culture.symbol}</span>
        <h1 className="text-2xl font-semibold">{culture.name}</h1>
      </div>
      <p className="text-neutral-400 mb-4">{culture.description}</p>
      <p className="text-sm text-neutral-500 mb-6">{culture.membersCount} members</p>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {user && !isMember && (
        <button
          onClick={handleJoin}
          disabled={actionLoading}
          className="mb-6 px-4 py-2 bg-white text-black rounded-full disabled:opacity-50"
        >
          {actionLoading ? "Joining..." : "Join culture"}
        </button>
      )}

      {isMember && (
        <div className="mb-6 flex flex-wrap gap-4 text-sm items-center">
          <Link to={`/cultures/${id}/ritual`} className="underline">Today&apos;s ritual</Link>
          <Link to={`/cultures/${id}/feed`} className="underline">Culture feed</Link>
          {!isCreator && (
            <button
              onClick={handleLeave}
              disabled={actionLoading}
              className="text-neutral-500 hover:text-neutral-300 disabled:opacity-50"
            >
              {actionLoading ? "Leaving..." : "Leave culture"}
            </button>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-6 text-sm">
        <div>
          <h3 className="font-medium mb-2">Values</h3>
          <ul className="text-neutral-400 space-y-1">
            {culture.values?.map((v) => <li key={v}>{v}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="font-medium mb-2">Aesthetic</h3>
          <ul className="text-neutral-400 space-y-1">
            {culture.aesthetic?.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="font-medium mb-2">Jargon</h3>
          <ul className="text-neutral-400 space-y-1">
            {culture.jargon?.map((j) => <li key={j}>{j}</li>)}
          </ul>
        </div>
      </div>

      {culture.activeRituals?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-2 text-sm">Active rituals</h3>
          <ul className="text-neutral-400 space-y-1 text-sm">
            {culture.activeRituals.map((r) => <li key={r._id}>· {r.text}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
