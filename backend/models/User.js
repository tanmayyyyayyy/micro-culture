import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    joinedCultures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Culture" }],
    createdCultures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Culture" }],
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    joinedCultures: this.joinedCultures,
    createdCultures: this.createdCultures,
  };
};

export default mongoose.model("User", userSchema);
