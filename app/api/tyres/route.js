import { connectDB } from "@/lib/mongodb";
import Tyre from "@/lib/models/Tyre";
import { NextResponse } from "next/server";

// ✅ GET all tyres
export async function GET() {
  try {
    await connectDB();
    const tyres = await Tyre.find().populate("truckId", "number model"); // match schema field
    return NextResponse.json({ success: true, data: tyres });
  } catch (error) {
    return NextResponse.json({ success: false, data: [], error: error.message });
  }
}

// ✅ POST create tyre
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.truckId || !body.serial) {
      return NextResponse.json(
        { success: false, error: "Truck and Serial Number are required" },
        { status: 400 }
      );
    }

    const tyre = await Tyre.create({
      truckId: body.truckId,               // ✅ match schema
      brand: body.brand,
      serial: body.serial,                 // ✅ match frontend
      position: body.position,
      purchasePrice: body.purchasePrice,   // ✅ match frontend
      installedDate: body.installedDate,
      startingOdometer: body.startingOdometer,
      currentOdometer: body.currentOdometer,
    });

    return NextResponse.json({ success: true, data: tyre }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

// ✅ DELETE tyre
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const deleted = await Tyre.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Tyre not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Tyre deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
