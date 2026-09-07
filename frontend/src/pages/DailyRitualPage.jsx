import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client.js";

export default function DailyRitualPage() {
  const { id } = useParams();
  const [ritual, setRitual] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        // GET endpoint — idempotent, semantically correct (P0-10 fix)
        const { data } = await api.get(`/ai/daily-ritual/${id}`);
        setRitual(data);
      } catch (err) {
        setError(
          err.response?.status === 403
            ? "You must be a member of this culture to view today's ritual."
            : err.response?.data?.error || "Failed to load today's ritual"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handlePost(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    setError("");
    try {
      // Send ritualId alongside content (B6 fix — closes the culture memory loop)
      await api.post("/logs", {
        cultureId: id,
        ritualId: ritual?._id,
        content: content.trim(),
      });
      setPosted(true);
      setContent("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post ritual log");
    } finally {
      setPosting(false);
    }
  }

  if (loading) return <p className="text-neutral-500">Summoning today&apos;s ritual...</p>;
  if (error && !ritual) return <p className="text-red-400">{error}</p>;
  if (!ritual) return <p className="text-neutral-500">No ritual found for today.</p>;

  // Support both old (ritualText only) and new (structured) ritual documents
  const hasStructured = ritual.title && ritual.description;

  return (
    <div className="max-w-lg">
      <p className="text-xs text-neutral-500 mb-1">{ritual.date}</p>
      <h1 className="text-xl font-semibold mb-1">
        {hasStructured ? ritual.title : "Today's ritual"}
      </h1>

      {hasStructured ? (
        <>
          <p className="text-neutral-300 mb-4">{ritual.description}</p>

          {ritual.instructions?.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-medium mb-2 text-neutral-400">Instructions</h2>
              <ol className="list-decimal list-inside space-y-1 text-sm text-neutral-300">
                {ritual.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="flex gap-4 text-xs text-neutral-500 mb-6">
            {ritual.durationMinutes && <span>~{ritual.durationMinutes} min</span>}
            {ritual.difficulty && <span className="capitalize">{ritual.difficulty}</span>}
          </div>

          {ritual.reflectionPrompt && (
            <p className="text-sm italic text-neutral-400 mb-6 border-l-2 border-neutral-700 pl-3">
              {ritual.reflectionPrompt}
            </p>
          )}
        </>
      ) : (
        // Backward compat: old-format ritual with ritualText only
        <p className="text-lg mb-8">{ritual.ritualText}</p>
      )}

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {!posted ? (
        <form onSubmit={handlePost} className="space-y-3">
          <label className="block text-sm text-neutral-400">
            How did you complete this ritual?
          </label>
          <textarea
            placeholder="Share your experience..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded"
          />
          <button
            type="submit"
            disabled={posting || !content.trim()}
            className="px-4 py-2 bg-white text-black rounded-full disabled:opacity-50"
          >
            {posting ? "Posting..." : "Post to feed"}
          </button>
        </form>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-neutral-400">
            ✓ Logged.{" "}
            <Link to={`/cultures/${id}/feed`} className="underline">View culture feed</Link>
          </p>
          <button
            onClick={() => setPosted(false)}
            className="text-xs text-neutral-500 underline"
          >
            Add another log
          </button>
        </div>
      )}
    </div>
  );
}
