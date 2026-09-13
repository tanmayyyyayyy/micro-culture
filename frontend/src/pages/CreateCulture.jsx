import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import GlassPanel from "../components/ui/GlassPanel.jsx";
import GlowButton from "../components/ui/GlowButton.jsx";

const SYMBOL_PRESETS = ["🧘", "🌿", "⚔️", "✨", "🌊", "🔮", "🕯️", "🌌", "🏛️", "🪐", "🪶", "🧬"];

export default function CreateCulture() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  // Multi-step wizard state: "idea" -> "archetype" -> "review"
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [vibeWords, setVibeWords] = useState("");
  const [symbol, setSymbol] = useState("✨");
  const [color, setColor] = useState("#8b5cf6");

  // Blueprint state returned by AI
  const [blueprint, setBlueprint] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  // AI Generation Step
  async function handleGenerateBlueprint() {
    if (!name.trim() || !description.trim()) {
      setError("Please provide both a culture name and core description.");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const vibeArr = vibeWords
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      const { data } = await api.post("/ai/generate-culture", {
        name: name.trim(),
        description: description.trim(),
        vibeWords: vibeArr,
      });

      setBlueprint(data);
      if (data.symbol) setSymbol(data.symbol);
      setCurrentStep(3); // Advance to Review & Edit
    } catch (err) {
      setError(err.response?.data?.error || "Failed to formulate AI blueprint.");
    } finally {
      setGenerating(false);
    }
  }

  // Final Publish Step
  async function handlePublishCulture() {
    setPublishing(true);
    setError("");
    try {
      const vibeArr = vibeWords
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      const { data } = await api.post("/cultures", {
        name: name.trim(),
        description: description.trim(),
        vibeWords: vibeArr,
        symbol,
        color,
        aesthetic: blueprint?.aesthetic || [],
        values: blueprint?.values || [],
        jargon: blueprint?.jargon || [],
        rituals: blueprint?.rituals || [],
        isPublished: true,
      });

      // Refresh user context so dashboard sees the new culture (B2 fix)
      await refreshUser();
      // Directly transition to the newly consecrated culture
      navigate(`/cultures/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to consecrate culture.");
    } finally {
      setPublishing(false);
    }
  }

  function updateListField(field, index, value) {
    if (!blueprint) return;
    const nextList = [...blueprint[field]];
    nextList[index] = value;
    setBlueprint({ ...blueprint, [field]: nextList });
  }

  function addListItem(field, defaultValue = "") {
    if (!blueprint) return;
    setBlueprint({
      ...blueprint,
      [field]: [...(blueprint[field] || []), defaultValue],
    });
  }

  function removeListItem(field, index) {
    if (!blueprint) return;
    const nextList = blueprint[field].filter((_, i) => i !== index);
    setBlueprint({ ...blueprint, [field]: nextList });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Header & Stepper */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Create a Community
        </h1>
        <p className="text-sm text-neutral-400 max-w-md mx-auto">
          Give your community a name and vibe, then AI will build out its values, traditions, and daily activities.
        </p>

        {/* Stepper Indicators */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[
            { num: 1, label: "About your community" },
            { num: 2, label: "Look & feel" },
            { num: 3, label: "Review & create" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === s.num
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30 scale-105"
                    : currentStep > s.num
                    ? "bg-neutral-800 text-violet-400 border border-violet-500/30"
                    : "bg-neutral-900 text-neutral-500 border border-neutral-800"
                }`}
              >
                {currentStep > s.num ? "✓" : s.num}
              </div>
              <span
                className={`text-xs hidden sm:inline ${
                  currentStep === s.num ? "text-neutral-200 font-medium" : "text-neutral-500"
                }`}
              >
                {s.label}
              </span>
              {s.num < 3 && <div className="w-6 h-px bg-white/10 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Idea & Spark */}
      {currentStep === 1 && (
        <GlassPanel className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">1. About your community</h2>
            <p className="text-xs text-neutral-400">
              Give your community a name and description.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Name *
              </label>
              <input
                placeholder="e.g., Midnight Cartographers, The Solitary Forge, Neon Hermits"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Description *
              </label>
              <textarea
                rows={4}
                placeholder="What do members enjoy, believe, or practice? Describe the vibe..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={800}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Vibe keywords
              </label>
              <input
                placeholder="e.g., quiet, architectural, starlit, introspective (comma separated)"
                value={vibeWords}
                onChange={(e) => setVibeWords(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-end pt-2">
            <GlowButton
              variant="glow"
              disabled={!name.trim() || !description.trim()}
              onClick={() => {
                setError("");
                setCurrentStep(2);
              }}
            >
              Continue →
            </GlowButton>
          </div>
        </GlassPanel>
      )}

      {/* STEP 2: Aesthetic & Visual Ethos */}
      {currentStep === 2 && (
        <GlassPanel className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">2. Look &amp; Feel</h2>
            <p className="text-xs text-neutral-400">
              Pick an emoji and color to represent your community.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Symbol
            </label>
            <div className="flex flex-wrap gap-2.5 mb-3">
              {SYMBOL_PRESETS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSymbol(s)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                    symbol === s
                      ? "bg-violet-600/30 border-violet-500 scale-110 shadow-md shadow-violet-500/30"
                      : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <input
              placeholder="Or enter custom emoji..."
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.slice(0, 4))}
              className="w-40 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-sm text-center text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-neutral-400">{color}</span>
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-between items-center pt-2">
            <GlowButton variant="secondary" onClick={() => setCurrentStep(1)}>
              ← Back
            </GlowButton>
            <GlowButton
              variant="glow"
              loading={generating}
              onClick={handleGenerateBlueprint}
            >
              {generating ? "Generating..." : "Generate community →"}
            </GlowButton>
          </div>
        </GlassPanel>
      )}

      {/* STEP 3: Substantive Blueprint Review & Edit */}
      {currentStep === 3 && blueprint && (
        <GlassPanel className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider">
              <span>✧</span> Blueprint Ready
            </div>
            <h2 className="text-xl font-bold text-white">
              Review &amp; Edit
            </h2>
            <p className="text-xs text-neutral-400">
              AI has built out your community. Edit any value, tradition, or word before creating it.
            </p>
          </div>

          {/* Editable Sections */}
          <div className="space-y-6 divide-y divide-white/5">
            {/* Values */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                  Values ({blueprint.values?.length || 0})
                </h3>
                <button
                  type="button"
                  onClick={() => addListItem("values", "New value")}
                  className="text-xs text-violet-400 hover:text-violet-300"
                >
                  + Add Value
                </button>
              </div>
              <div className="space-y-2">
                {blueprint.values?.map((val, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={val}
                      onChange={(e) => updateListField("values", i, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-violet-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem("values", i)}
                      className="text-neutral-500 hover:text-red-400 text-xs p-1"
                      aria-label="Remove value"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Jargon / Lexicon */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  Community Words ({blueprint.jargon?.length || 0})
                </h3>
                <button
                  type="button"
                  onClick={() => addListItem("jargon", "Term: Meaning")}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  + Add Word
                </button>
              </div>
              <div className="space-y-2">
                {blueprint.jargon?.map((term, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={term}
                      onChange={(e) => updateListField("jargon", i, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem("jargon", i)}
                      className="text-neutral-500 hover:text-red-400 text-xs p-1"
                      aria-label="Remove jargon"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Starter Rituals */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Activity Archetypes ({blueprint.rituals?.length || 0})
                </h3>
                <button
                  type="button"
                  onClick={() => addListItem("rituals", "New ritual archetype")}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  + Add Activity
                </button>
              </div>
              <div className="space-y-2">
                {blueprint.rituals?.map((rit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={rit}
                      onChange={(e) => updateListField("rituals", i, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem("rituals", i)}
                      className="text-neutral-500 hover:text-red-400 text-xs p-1"
                      aria-label="Remove ritual"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Aesthetic Codes */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  Aesthetic Codes ({blueprint.aesthetic?.length || 0})
                </h3>
                <button
                  type="button"
                  onClick={() => addListItem("aesthetic", "New aesthetic code")}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  + Add Keyword
                </button>
              </div>
              <div className="space-y-2">
                {blueprint.aesthetic?.map((aes, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={aes}
                      onChange={(e) => updateListField("aesthetic", i, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem("aesthetic", i)}
                      className="text-neutral-500 hover:text-red-400 text-xs p-1"
                      aria-label="Remove aesthetic keyword"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <GlowButton variant="secondary" onClick={() => setCurrentStep(2)}>
              ← Back
            </GlowButton>
            <GlowButton
              variant="glow"
              size="lg"
              loading={publishing}
              onClick={handlePublishCulture}
            >
              {publishing ? "Creating..." : "Create Community ✦"}
            </GlowButton>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
