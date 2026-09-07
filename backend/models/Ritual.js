import mongoose from "mongoose";

const ritualSchema = new mongoose.Schema(
  {
    cultureId: { type: mongoose.Schema.Types.ObjectId, ref: "Culture", required: true },
    text: { type: String, required: true },
    isAIgenerated: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "retired", "suggested"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Ritual", ritualSchema);
