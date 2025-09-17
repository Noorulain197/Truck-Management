import mongoose from "mongoose";

const TruckSchema = new mongoose.Schema({
  model: { type: String, required: true },
  capacity: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ["active", "inactive", "maintenance"], 
    default: "active" 
  },

  // Maintenance and mileage tracking
  currentMileage: { type: Number, default: 0 },
  lastOilChangeAt: { type: Number, default: 0 },
  lastTyreChangeAt: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Truck || mongoose.model("Truck", TruckSchema);
