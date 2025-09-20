import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Dealer from "../../../lib/models/Dealer";

export async function GET() {
  try {
    await connectDB();
    const dealers = await Dealer.find().lean();
    return NextResponse.json(dealers);
  } catch (err) {
    console.error("GET /api/dealers error:", err);
    return NextResponse.json({ error: "Failed to fetch dealers" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: "Dealer name is required" }, { status: 400 });
    }

    const dealer = await Dealer.create(body);
    return NextResponse.json(dealer);
  } catch (err) {
    console.error("POST /api/dealers error:", err);
    return NextResponse.json({ error: "Failed to create dealer" }, { status: 500 });
  }
}
