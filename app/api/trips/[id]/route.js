import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Trip from "@/lib/models/Trip";

// 🗑 DELETE Trip
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Trip ID is required" },
        { status: 400 }
      );
    }

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

// ✏️ UPDATE Trip
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Trip ID is required" },
        { status: 400 }
      );
    }

    const updatedTrip = await Trip.findByIdAndUpdate(id, body, {
      new: true,          // return updated doc
      runValidators: true // validate schema
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
