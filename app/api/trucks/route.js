import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Truck from "@/lib/models/Truck";

// 🔹 GET all trucks
export async function GET() {
  try {
    await connectDB();
    const trucks = await Truck.find().lean();
    return NextResponse.json(trucks, { status: 200 });
  } catch (err) {
    console.error("GET /api/trucks error:", err);
    return NextResponse.json({ error: "Failed to fetch trucks" }, { status: 500 });
  }
}

// 🔹 POST create truck
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const truck = await Truck.create({
      number: body.number,
      model: body.model,
      capacity: body.capacity,
      status: body.status || "active",
      currentMileage: body.currentMileage || 0,
      lastOilChangeAt: body.lastOilChangeAt || 0,
      lastTyreChangeAt: body.lastTyreChangeAt || 0,
    });

    return NextResponse.json(truck, { status: 201 });
  } catch (err) {
    console.error("POST /api/trucks error:", err);
    return NextResponse.json({ error: "Failed to create truck" }, { status: 500 });
  }
}