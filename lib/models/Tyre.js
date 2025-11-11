import mongoose from "mongoose";

const TyreSchema = new mongoose.Schema({
  truckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Truck",
    required: true,
  },
  brand: { type: String },
  serial: { type: String, required: true },
  position: { type: String },
  purchasePrice: { type: Number },
  installedDate: { type: String },
  startingOdometer: { type: Number },
  currentOdometer: { type: Number },
  status: { type: String, default: "OK" },
  usagePct: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Tyre || mongoose.model("Tyre", TyreSchema);
