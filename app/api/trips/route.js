import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Trip from "@/lib/models/Trip";
import Dealer from "@/lib/models/Dealer";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // 🧮 calculate pending (auto if not given)
    const amount_pending =
      body.amount_pending !== undefined
        ? Number(body.amount_pending)
        : Number(body.total_sale || 0) - Number(body.amount_received || 0);

    // 🧮 calculate total income
    const total_income =
      Number(body.amount_received || 0) -
      (Number(body.expenses || 0) +
        Number(body.fuel_cost || 0) +
        Number(body.other_expenses || 0));

    // 🧮 calculate commission + company profit
    const driverCommission = total_income * 0.1;
    const companyProfit = total_income - driverCommission;

    const tripDoc = await Trip.create({
      driver: body.driver,
      truck: body.truck,
      dealer: body.dealer || null,
      pickup_city: body.pickup_city || "",
      dropoff_city: body.dropoff_city || "",
      date: body.date ? new Date(body.date) : new Date(),

      total_sale: Number(body.total_sale || 0),
      amount_received: Number(body.amount_received || 0),
      amount_pending,
      expenses: Number(body.expenses || 0),
      fuel_cost: Number(body.fuel_cost || 0),
      other_expenses: Number(body.other_expenses || 0),

      total_income,
      driverCommission,
      companyProfit,
      kilometres: Number(body.kilometres || 0),
    });

    // 📊 update Dealer aggregates if dealer exists
    if (body.dealer && mongoose.Types.ObjectId.isValid(body.dealer)) {
      await Dealer.findByIdAndUpdate(body.dealer, {
        $inc: {
          totalTrips: 1,
          totalBusiness: Number(body.total_sale || 0),
          totalPending: amount_pending,
        },
      });
    }

    return NextResponse.json(tripDoc, { status: 201 });
  } catch (err) {
    console.error("❌ Error creating trip:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const trips = await Trip.find()
      .populate("driver", "name")  // ✅ only fetch name
      .populate("truck", "number") // ✅ only fetch number
      .populate("dealer", "name"); // ✅ only fetch name

    return NextResponse.json(trips, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching trips:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
