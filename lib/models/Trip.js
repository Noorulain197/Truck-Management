import mongoose from "mongoose";

const TripSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver", // 🔗 Driver model ko reference
      required: true,
    },
    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck", // 🔗 Truck model ko reference
      required: true,
    },
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealer", // 🔗 Dealer model ko reference
      default: null,
    },

    // 📍 Trip details
    pickup_city: { type: String, trim: true },
    dropoff_city: { type: String, trim: true },
    date: { type: Date, default: () => new Date() },

    // 💰 Finance fields
    total_sale: { type: Number, default: 0 }, // Total Bill
    amount_received: { type: Number, default: 0 }, // Amount Received
    amount_pending: { type: Number, default: 0 }, // Amount Pending

    expenses: { type: Number, default: 0 }, // General Expenses
    fuel_cost: { type: Number, default: 0 }, // Fuel Cost
    other_expenses: { type: Number, default: 0 }, // Other Expenses

    // 📊 Calculated values
    total_income: { type: Number, default: 0 }, // Total Income
    driverCommission: { type: Number, default: 0 }, // Driver Commission
    companyProfit: { type: Number, default: 0 }, // Company Profit
    kilometres: { type: Number, default: 0 }, // Mileage
  },
  { timestamps: true }
);

// 🛑 Avoid model overwrite error in Next.js hot reload
export default mongoose.models.Trip || mongoose.model("Trip", TripSchema);
