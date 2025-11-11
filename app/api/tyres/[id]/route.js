import { connectDB } from "@/lib/mongodb";
import Tyre from "@/lib/models/Tyre";

// PUT update tyre
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();

    const tyre = await Tyre.findByIdAndUpdate(
      params.id,
      {
        tyreNumber: body.serial,
        brand: body.brand,
        position: body.position,
        truck: body.truckId,
        purchaseDate: body.installedDate,
        price: body.purchasePrice,
      },
      { new: true }
    ).populate("truck", "number model");

    if (!tyre)
      return new Response(
        JSON.stringify({ success: false, error: "Tyre not found" }),
        { status: 404 }
      );

    return new Response(JSON.stringify({ success: true, data: tyre }), { status: 200 });
  } catch (err) {
    console.error("PUT /api/tyres/[id] error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
    });
  }
}

// DELETE tyre
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    // fallback if frontend sends ?id= instead of /id
    const { searchParams } = new URL(req.url);
    const id = params?.id || searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: "No ID provided" }),
        { status: 400 }
      );
    }

    const deleted = await Tyre.findByIdAndDelete(id);
    if (!deleted)
      return new Response(
        JSON.stringify({ success: false, error: "Tyre not found" }),
        { status: 404 }
      );

    return new Response(JSON.stringify({ success: true, message: "Tyre deleted" }), {
      status: 200,
    });
  } catch (err) {
    console.error("DELETE /api/tyres/[id] error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
    });
  }
}
