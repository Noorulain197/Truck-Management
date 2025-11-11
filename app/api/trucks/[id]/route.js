import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Truck from "@/lib/models/Truck";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request) {
  try {
    const id = request.url.split("/").pop();
    if (!isValidId(id)) {
      return NextResponse.json({ success: false, error: "Invalid truck ID" }, { status: 400 });
    }

    await connectDB();
    const truck = await Truck.findById(id);
    if (!truck) {
      return NextResponse.json({ success: false, error: "Truck not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: truck });
  } catch (err) {
    console.error("GET /api/trucks/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const id = request.url.split("/").pop();
    if (!isValidId(id)) {
      return NextResponse.json({ success: false, error: "Invalid truck ID" }, { status: 400 });
    }

    const body = await request.json();
    await connectDB();
    const updatedTruck = await Truck.findByIdAndUpdate(id, body, { new: true });

    if (!updatedTruck) {
      return NextResponse.json({ success: false, error: "Truck not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedTruck });
  } catch (err) {
    console.error("PUT /api/trucks/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const id = request.url.split("/").pop();
    if (!isValidId(id)) {
      return NextResponse.json({ success: false, error: "Invalid truck ID" }, { status: 400 });
    }

    await connectDB();
    const deletedTruck = await Truck.findByIdAndDelete(id);

    if (!deletedTruck) {
      return NextResponse.json({ success: false, error: "Truck not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Truck deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/trucks/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}
