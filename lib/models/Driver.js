import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  phone: { type: String, required: true },
  license_no: { type: String, required: true },
  totalTrips: { type: Number, default: 0 },
  totalCommission: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Driver || mongoose.model("Driver", DriverSchema);
