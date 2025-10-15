import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Driver from "../../../lib/models/Driver";

// 🔹 GET all drivers
export async function GET() {
  try {
    await connectDB();
    const drivers = await Driver.find().lean();
    return NextResponse.json({ success: true, data: drivers }, { status: 200 });
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

    if (!body.full_name || !body.phone || !body.license_no) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name, phone, and license number are required",
        },
        { status: 400 }
      );
    }

    const driver = await Driver.create(body);
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
