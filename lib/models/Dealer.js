import mongoose from "mongoose";

const DealerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },

  totalTrips: { type: Number, default: 0 },
  totalBusiness: { type: Number, default: 0 },
  totalPending: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Dealer || mongoose.model("Dealer", DealerSchema);
