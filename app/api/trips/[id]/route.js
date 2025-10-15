import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Trip from "@/lib/models/Trip";

// 🔹 GET a single Trip
export async function GET(req, context) {
  const { params } = await context;
  const id = params.id;

  try {
    await connectDB();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Valid Trip ID is required" },
        { status: 400 }
      );
    }

    const trip = await Trip.findById(id)
      .populate("driver", "full_name")
      .populate("truck", "number model")
      .populate("dealer", "name");

    if (!trip) {
      return NextResponse.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: trip }, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching trip:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch trip", error: err.message },
      { status: 500 }
    );
  }
}

// 🔹 DELETE a Trip
export async function DELETE(req) {
  try {
    // Extract ID from URL
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Valid Trip ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const deletedTrip = await Trip.findByIdAndDelete(id);

    if (!deletedTrip) {
      return NextResponse.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Trip deleted successfully", data: deletedTrip },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error deleting trip:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete trip", error: err.message },
      { status: 500 }
    );
  }
}

// 🔹 UPDATE a Trip
export async function PUT(req, context) {
  const { params } = await context;
  const id = params.id;

  try {
    await connectDB();
    const body = await req.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Valid Trip ID is required" },
        { status: 400 }
      );
    }

    const updatedTrip = await Trip.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTrip) {
      return NextResponse.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Trip updated successfully", data: updatedTrip },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error updating trip:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update trip", error: err.message },
      { status: 500 }
    );
  }
}