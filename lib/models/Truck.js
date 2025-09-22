import mongoose from "mongoose";

const TruckSchema = new mongoose.Schema(
  {
    number: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    }, // Truck number plate / registration

    model: { 
      type: String, 
      required: true, 
      trim: true,
      uppercase: true 
    }, // Truck model (always stored in UPPERCASE)

    capacity: { 
      type: Number, 
      default: 0, 
      min: 0 
    }, // Capacity in tons

    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    }, // Current truck status

    // Maintenance & mileage tracking
    currentMileage: { type: Number, default: 0, min: 0 },
    lastOilChangeAt: { type: Number, default: 0, min: 0 },
    lastTyreChangeAt: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Truck || mongoose.model("Truck", TruckSchema);
