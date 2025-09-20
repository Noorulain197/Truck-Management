// app/api/drivers/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Driver from "@/lib/models/Driver";

// ✅ UPDATE driver
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const updatedDriver = await Driver.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDriver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    return NextResponse.json(updatedDriver);
  } catch (err) {
    console.error("Error updating driver:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ DELETE driver
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const deletedDriver = await Driver.findByIdAndDelete(id);

    if (!deletedDriver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Driver deleted successfully" });
  } catch (err) {
    console.error("Error deleting driver:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
