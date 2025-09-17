"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function TrucksPage() {
  const [trucks, setTrucks] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    model: "",
    capacity: "",
    currentMileage: "",
  });

  // fetch trucks + trips
  useEffect(() => {
    async function fetchData() {
      try {
        const [truckRes, tripRes] = await Promise.all([
          axios.get("/api/trucks"),
          axios.get("/api/trips"),
        ]);
        setTrucks(truckRes.data);
        setTrips(tripRes.data);
      } catch (err) {
        console.error("Error fetching trucks or trips:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // truckwise income calc
  function calculateIncome(truckId) {
    const truckTrips = trips.filter((t) => t.truck?._id === truckId);
    return truckTrips.reduce((sum, t) => sum + (t.total_sale || 0), 0);
  }

  // form handle
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await axios.post("/api/trucks", form);
      setTrucks((prev) => [...prev, res.data]);
      setForm({ model: "", capacity: "", currentMileage: "" });
      setShowForm(false);
    } catch (err) {
      console.error("Error adding truck:", err);
    }
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-navy-900">Trucks</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-900 transition"
        >
          + Add Truck
        </button>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden text-sm md:text-base">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border">Truck Model</th>
              <th className="px-4 py-2 border">Capacity</th>
              <th className="px-4 py-2 border">Truckwise Income</th>
            </tr>
          </thead>
          <tbody>
            {trucks.map((truck) => (
              <tr key={truck._id} className="text-center">
                <td className="border px-4 py-2">{truck.model || "N/A"}</td>
                <td className="border px-4 py-2">{truck.capacity || 0}</td>
                <td className="border px-4 py-2">
                  {calculateIncome(truck._id)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* modal form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-navy-900">Add New Truck</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Model</label>
                <input
                  type="text"
                  required
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg"
                  placeholder="e.g., Volvo FH16"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Capacity (tons)</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg"
                  placeholder="e.g., 20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Current Mileage (km)</label>
                <input
                  type="number"
                  value={form.currentMileage}
                  onChange={(e) =>
                    setForm({ ...form, currentMileage: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-lg"
                  placeholder="e.g., 40000"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-lg text-black hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-900 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
