import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Driver from "../../../lib/models/Driver";

// GET /api/drivers
export async function GET() {
  try {
    await connectDB();
    const drivers = await Driver.find().lean();
    return NextResponse.json(drivers, { status: 200 });
  } catch (err) {
    console.error("❌ GET /api/drivers error:", err);
    return NextResponse.json(
      { error: "Failed to fetch drivers", details: err.message },
      { status: 500 }
    );
  }
}

// POST /api/drivers
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    console.log("📩 Incoming body:", body);

    if (!body.full_name || !body.phone || !body.license_no) {
      return NextResponse.json(
        { error: "Full name, phone, and license number are required" },
        { status: 400 }
      );
    }

    const driver = await Driver.create(body);
    console.log("✅ Driver created:", driver);

    return NextResponse.json(driver, { status: 201 });
  } catch (err) {
    console.error("❌ POST /api/drivers error:", err);

    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate entry: driver already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create driver", details: err.message, stack: err.stack },
      { status: 500 }
    );
  }
}
