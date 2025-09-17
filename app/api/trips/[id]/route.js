import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Trip from "../../../../lib/models/Trip";

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    await Trip.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
