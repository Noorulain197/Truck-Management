// app/api/drivers/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Driver from "../../../lib/models/Driver";

// 🔹 GET all drivers
export async function GET() {
  try {
    await connectDB();
    const drivers = await Driver.find().lean();

    // Ensure every driver has _id and full_name
    const safeDrivers = drivers.map(d => ({
      _id: d._id?.toString() || "",
      full_name: d.full_name || "Unnamed Driver",
      phone: d.phone || "",
      license_no: d.license_no || "",
    }));

    return NextResponse.json({ success: true, data: safeDrivers }, { status: 200 });
  } catch (err) {
    console.error("GET /api/drivers error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch drivers", error: err.message },
      { status: 500 }
    );
  }
}

// 🔹 POST create driver
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // Basic validation
    if (!body.full_name?.trim() || !body.phone?.trim() || !body.license_no?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name, phone, and license number are required",
        },
        { status: 400 }
      );
    }

    // Create driver
    const driver = await Driver.create({
      full_name: body.full_name.trim(),
      phone: body.phone.trim(),
      license_no: body.license_no.trim(),
    });

    return NextResponse.json(
      { success: true, message: "Driver created successfully", data: driver },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/drivers error:", err);
    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Duplicate driver entry" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to create driver", error: err.message },
      { status: 500 }
    );
  }
}
