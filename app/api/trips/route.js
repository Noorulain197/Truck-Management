import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Trip from "@/lib/models/Trip";
import Dealer from "@/lib/models/Dealer";

// 🔹 POST create trip
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { driver, truck, dealer, pickup_city, dropoff_city, date } = body;

    if (!driver || !mongoose.Types.ObjectId.isValid(driver)) {
      return NextResponse.json(
        { success: false, message: "Valid driver ID is required" },
        { status: 400 }
      );
    }
    if (!truck || !mongoose.Types.ObjectId.isValid(truck)) {
      return NextResponse.json(
        { success: false, message: "Valid truck ID is required" },
        { status: 400 }
      );
    }

    const amount_pending =
      body.amount_pending !== undefined
        ? Number(body.amount_pending)
        : Number(body.total_sale || 0) - Number(body.amount_received || 0);

    const total_income =
      Number(body.total_sale || 0) -
      (Number(body.expenses || 0) +
        Number(body.fuel_cost || 0) +
        Number(body.other_expenses || 0));

    const driverCommission = total_income * 0.1;
    const companyProfit = total_income - driverCommission;

    const tripDoc = await Trip.create({
      driver,
      truck,
      dealer: dealer || null,
      pickup_city: pickup_city || "",
      dropoff_city: dropoff_city || "",
      date: date ? new Date(date) : new Date(),

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

    if (dealer && mongoose.Types.ObjectId.isValid(dealer)) {
      await Dealer.findByIdAndUpdate(dealer, {
        $inc: {
          totalTrips: 1,
          totalBusiness: Number(body.total_sale || 0),
          totalPending: amount_pending,
        },
      });
    }

    return NextResponse.json(
      { success: true, message: "Trip created successfully", data: tripDoc },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error creating trip:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create trip", error: err.message },
      { status: 500 }
    );
  }
}

// 🔹 GET all trips
export async function GET() {
  try {
    await connectDB();
    const trips = await Trip.find()
      .populate("driver", "full_name")
      .populate("truck", "number model")
      .populate("dealer", "name");

    return NextResponse.json({ success: true, data: trips }, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching trips:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch trips", error: err.message },
      { status: 500 }
    );
  }
}
