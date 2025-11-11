import { connectDB } from "@/lib/mongodb";
import Truck from "@/lib/models/Truck";
import Tyre from "@/lib/models/Tyre";
import { NextResponse } from "next/server";

// GET all trucks
export async function GET() {
  try {
    console.log("📡 Fetching trucks...");
    await connectDB();
    const trucks = await Truck.find().lean();
    console.log("✅ Trucks fetched:", trucks.length);
    return NextResponse.json({ success: true, data: trucks });
  } catch (error) {
    console.error("❌ Truck GET Error:", error);
    return NextResponse.json({ success: false, data: [], error: error.message }, { status: 500 });
  }
}

// POST create truck
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.number || !body.model) {
      return NextResponse.json({ success: false, error: "Truck number and model are required" }, { status: 400 });
    }
    const truck = await Truck.create({
      number: body.number,
      model: body.model,
      capacity: body.capacity || 0,
      status: body.status || "active",
      currentMileage: body.currentMileage || 0,
      lastOilChangeAt: body.lastOilChangeAt || 0,
      lastTyreChangeAt: body.lastTyreChangeAt || 0
    });
    return NextResponse.json({ success: true, data: truck }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
