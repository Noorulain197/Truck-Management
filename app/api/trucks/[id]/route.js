import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Truck from "@/lib/models/Truck";

// Utility: validate MongoDB ID
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET single truck
export async function GET(req, { params }) {
  const { id } = params;

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid truck ID" }, { status: 400 });
  }

  try {
    await connectDB();
    const truck = await Truck.findById(id);

    if (!truck) {
      return NextResponse.json({ error: "Truck not found" }, { status: 404 });
    }

    return NextResponse.json(truck);
  } catch (err) {
    console.error("GET /api/trucks/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT: update truck
export async function PUT(req, { params }) {
  const { id } = params;

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid truck ID" }, { status: 400 });
  }

  try {
    await connectDB();
    const body = await req.json();

    const updatedTruck = await Truck.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTruck) {
      return NextResponse.json({ error: "Truck not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTruck);
  } catch (err) {
    console.error("PUT /api/trucks/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: remove truck
export async function DELETE(req, { params }) {
  const { id } = params;

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid truck ID" }, { status: 400 });
  }

  try {
    await connectDB();
    const deletedTruck = await Truck.findByIdAndDelete(id);

    if (!deletedTruck) {
      return NextResponse.json({ error: "Truck not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Truck deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/trucks/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
