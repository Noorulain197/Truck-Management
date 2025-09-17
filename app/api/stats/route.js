// app/api/stats/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Trip from "@/lib/models/Trip";
import Driver from "@/lib/models/Driver";
import Truck from "@/lib/models/Truck";

export async function GET() {
  try {
    await connectDB();

    // Total drivers & trucks
    const drivers = await Driver.countDocuments();
    const trucks = await Truck.countDocuments();

    // All trips
    const trips = await Trip.find();

    // --- Financial calculations ---
    let income = 0;      // total sale
    let expense = 0;     // fuel + other_expenses
    let pending = 0;     // companyProfit can be treated as pending/unsettled
    let mileage = 0;     // total kilometres

    trips.forEach((t) => {
      income += Number(t.total_sale || 0);
      expense += Number(t.fuel_cost || 0) + Number(t.other_expenses || 0);
      mileage += Number(t.kilometres || 0);
      pending += Number(t.companyProfit || 0);
    });

    // --- Activity chart (last 7 days trips count) ---
    const last7days = new Date();
    last7days.setDate(last7days.getDate() - 6);

    const activityData = await Trip.aggregate([
      { $match: { date: { $gte: last7days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const activity = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date();
      day.setDate(day.getDate() - (6 - i));
      const dateStr = day.toISOString().split("T")[0];

      const found = activityData.find((d) => d._id === dateStr);
      activity.push({
        date: dateStr,
        count: found ? found.count : 0,
      });
    }

    return NextResponse.json({
      drivers,
      trucks,
      income,
      expense,
      pending,
      mileage,
      activity,
    });
  } catch (err) {
    console.error("Stats API Error:", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
