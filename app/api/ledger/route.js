// app/api/ledger/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Trip from "../../../lib/models/Trip";
import mongoose from "mongoose";

export async function GET(req) {
  await connectDB();

  // optional query param ?date=YYYY-MM-DD
  const url = new URL(req.url);
  const dateStr = url.searchParams.get("date");

  let start, end;
  if (dateStr) {
    start = new Date(dateStr);
    start.setHours(0,0,0,0);
    end = new Date(start); end.setDate(start.getDate() + 1);
  } else {
    start = new Date(); start.setHours(0,0,0,0);
    end = new Date(start); end.setDate(start.getDate() + 1);
  }

  const pipeline = [
    { $match: { date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: null,
        totalSale: { $sum: "$total_sale" },
        totalFuel: { $sum: "$fuel_cost" },
        totalOther: { $sum: "$other_expenses" },
        totalDriverCommission: { $sum: "$driverCommission" },
        totalProfit: { $sum: "$companyProfit" },
        count: { $sum: 1 },
      }
    }
  ];

  const res = await Trip.aggregate(pipeline);
  const summary = res[0] || {
    totalSale: 0, totalFuel: 0, totalOther: 0, totalDriverCommission: 0, totalProfit: 0, count: 0
  };

  return NextResponse.json(summary);
}
