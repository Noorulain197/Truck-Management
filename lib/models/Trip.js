// models/Trip.js
import mongoose from "mongoose";

const TripSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
  truck: { type: mongoose.Schema.Types.ObjectId, ref: "Truck", required: true },
  dealer: { type: mongoose.Schema.Types.ObjectId, ref: "Dealer", default: null }, // ✅ add this

  pickup_city: String,
  dropoff_city: String,
  date: { type: Date, default: () => new Date() },

  total_sale: { type: Number, default: 0 },
  fuel_cost: { type: Number, default: 0 },
  other_expenses: { type: Number, default: 0 },
  kilometres: { type: Number, default: 0 },

  driverCommission: { type: Number, default: 0 },
  companyProfit: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Trip || mongoose.model("Trip", TripSchema);
