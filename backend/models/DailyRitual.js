import mongoose from "mongoose";

const dailyRitualSchema = new mongoose.Schema(
  {
    cultureId: { type: mongoose.Schema.Types.ObjectId, ref: "Culture", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD, one per culture per day

    // Legacy field — kept for backward compat with existing documents
    ritualText: { type: String, default: "" },

    // Structured fields populated by new AI generation
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    instructions: [{ type: String }],
    durationMinutes: { type: Number, default: null },
    difficulty: { type: String, enum: ["easy", "medium", "hard", ""], default: "" },
    reflectionPrompt: { type: String, default: "" },
    reason: { type: String, default: "" }, // why AI chose this ritual given culture history
  },
  { timestamps: true }
);

// Unique: one ritual per culture per calendar day
dailyRitualSchema.index({ cultureId: 1, date: 1 }, { unique: true });

export default mongoose.model("DailyRitual", dailyRitualSchema);
