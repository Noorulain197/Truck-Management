import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true }, // 👈 naam
    phone: { type: String, required: true },     // 👈 contact
    license_no: { type: String, required: true, unique: true }, // 👈 license unique
    totalTrips: { type: Number, default: 0 },        // ✅ auto update
    totalCommission: { type: Number, default: 0 },   // ✅ auto update
  },
  { timestamps: true }
);

// 🛑 Avoid overwrite on hot reload
export default mongoose.models.Driver || mongoose.model("Driver", DriverSchema);
