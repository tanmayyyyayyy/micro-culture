import mongoose from "mongoose";

const ritualLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cultureId: { type: mongoose.Schema.Types.ObjectId, ref: "Culture", required: true },
    ritualId: { type: mongoose.Schema.Types.ObjectId, ref: "Ritual" },
    content: { type: String, required: true },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("RitualLog", ritualLogSchema);
