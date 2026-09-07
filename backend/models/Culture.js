import mongoose from "mongoose";

const cultureSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    vibeWords: [{ type: String }],
    aesthetic: [{ type: String }],
    values: [{ type: String }],
    jargon: [{ type: String }],
    rituals: [{ type: String }], // starter rituals text; full Ritual docs live in Ritual collection
    symbol: { type: String, default: "" }, // emoji or short symbol
    imageUrl: { type: String, default: "" },
    color: { type: String, default: "" },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPublished: { type: Boolean, default: false }, // false until creator approves AI blueprint
  },
  { timestamps: true }
);

cultureSchema.virtual("membersCount").get(function () {
  return this.members?.length || 0;
});
cultureSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Culture", cultureSchema);
