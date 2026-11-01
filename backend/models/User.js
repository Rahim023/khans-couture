import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  customerId: { type: String, unique: true, sparse: true },
  emailVerified: { type: Boolean, default: true },
  emailVerificationCode: { type: String, default: null },
  emailVerificationExpires: { type: Date, default: null },
}, { timestamps: true });

// 🔹 Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔹 Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
