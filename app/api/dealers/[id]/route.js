import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Dealer from "@/lib/models/Dealer";

export async function PUT(request) {
  try {
    const id = request.url.split('/').pop();
    
    if (!id) return NextResponse.json({ error: "Dealer ID is required" }, { status: 400 });

    await connectDB();
    const body = await request.json();

    const updatedDealer = await Dealer.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    if (!updatedDealer) return NextResponse.json({ error: "Dealer not found" }, { status: 404 });

    return NextResponse.json(updatedDealer);
  } catch (err) {
    console.error("PUT /api/dealers/[id] error:", err);
    return NextResponse.json({ error: "Failed to update dealer" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const id = request.url.split('/').pop();

    if (!id) return NextResponse.json({ error: "Dealer ID is required" }, { status: 400 });

    await connectDB();
    const deletedDealer = await Dealer.findByIdAndDelete(id);

    if (!deletedDealer) return NextResponse.json({ error: "Dealer not found" }, { status: 404 });

    return NextResponse.json({ message: "Dealer deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/dealers/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete dealer" }, { status: 500 });
  }
}