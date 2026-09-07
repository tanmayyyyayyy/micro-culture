import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function CreateCulture() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState("seed"); // seed -> review -> done
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [vibeWords, setVibeWords] = useState("");
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const vibeArr = vibeWords.split(",").map((v) => v.trim()).filter(Boolean);
      const { data } = await api.post("/ai/generate-culture", {
        name,
        description,
        vibeWords: vibeArr,
      });
      setBlueprint(data);
      setStep("review");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate blueprint");
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    setLoading(true);
    setError("");
    try {
      const vibeArr = vibeWords.split(",").map((v) => v.trim()).filter(Boolean);
      const { data } = await api.post("/cultures", {
        name,
        description,
        vibeWords: vibeArr,
        ...blueprint,
        isPublished: true,
      });
      // Refresh user context so dashboard sees new culture immediately (B2 fix)
      await refreshUser();
      navigate(`/cultures/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to publish culture");
    } finally {
      setLoading(false);
    }
  }

  // Simple editable-list helper for blueprint fields
  function updateListField(field, index, value) {
    const next = [...blueprint[field]];
    next[index] = value;
    setBlueprint({ ...blueprint, [field]: next });
  }

  if (step === "seed") {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-semibold mb-6">Create a culture</h1>
        <form onSubmit={handleGenerate} className="space-y-4">
          <input
            placeholder="Culture name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded"
          />
          <textarea
            placeholder="Short description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded"
          />
          <input
            placeholder="2-3 vibe words, comma separated"
            value={vibeWords}
            onChange={(e) => setVibeWords(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !name || !description}
            className="w-full py-2 bg-white text-black rounded-full disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate blueprint with AI"}
          </button>
        </form>
      </div>
    );
  }

  // step === "review"
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-2">Review & edit</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Edit anything before publishing. Nothing goes live until you approve it.
      </p>

      <div className="mb-4">
        <p className="text-sm mb-1">Symbol: {blueprint.symbol}</p>
      </div>

      {["aesthetic", "values", "jargon", "rituals"].map((field) => (
        <div key={field} className="mb-4">
          <h3 className="font-medium capitalize mb-2">{field}</h3>
          {blueprint[field].map((val, i) => (
            <input
              key={i}
              value={val}
              onChange={(e) => updateListField(field, i, e.target.value)}
              className="w-full mb-2 px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-sm"
            />
          ))}
        </div>
      ))}

      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

      <div className="flex gap-3">
        <button onClick={() => setStep("seed")} className="px-4 py-2 border border-neutral-700 rounded-full">
          Back
        </button>
        <button
          onClick={handlePublish}
          disabled={loading}
          className="px-4 py-2 bg-white text-black rounded-full disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Approve & publish"}
        </button>
      </div>
    </div>
  );
}
