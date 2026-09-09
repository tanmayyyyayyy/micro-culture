import mongoose from "mongoose";

const ritualLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cultureId: { type: mongoose.Schema.Types.ObjectId, ref: "Culture", required: true },
    // References DailyRitual — the AI-generated ritual the member was responding to.
    // This closes the culture memory loop: future rituals can see what was completed.
    ritualId: { type: mongoose.Schema.Types.ObjectId, ref: "DailyRitual" },
    content: { type: String, required: true },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("RitualLog", ritualLogSchema);
