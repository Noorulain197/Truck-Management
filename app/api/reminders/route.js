// app/api/reminders/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Truck from "../../../lib/models/Truck";

export async function GET() {
  await connectDB();
  const threshold = Number(process.env.MAINTENANCE_THRESHOLD_KM ?? 4000);

  const trucks = await Truck.find().lean();

  const reminders = trucks.map(t => {
    const kmsSinceOil = (t.currentMileage || 0) - (t.lastOilChangeAt || 0);
    const kmsSinceTyre = (t.currentMileage || 0) - (t.lastTyreChangeAt || 0);

    return {
      truckId: t._id,
      model: t.model,
      currentMileage: t.currentMileage || 0,
      kmsSinceOil,
      kmsSinceTyre,
      oilDue: kmsSinceOil >= threshold,
      tyreDue: kmsSinceTyre >= threshold,
    };
  });

  return NextResponse.json(reminders);
}
