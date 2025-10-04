export async function POST(req) {
  try {
    // Example logic: you can reset or log mileage reset here
    console.log("✅ Mileage cleared successfully!");

    // Optional: respond back with a message
    return new Response(
      JSON.stringify({ message: "Mileage cleared successfully!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error clearing mileage:", error);
    return new Response(
      JSON.stringify({ error: "Failed to clear mileage" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
