// app/api/dealers/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Dealer from "../../../lib/models/Dealer";

export async function GET() {
  await connectDB();
  const dealers = await Dealer.find().lean();
  return NextResponse.json(dealers);
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const dealer = await Dealer.create(body);
  return NextResponse.json(dealer);
}
