"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TrucksPage() {
  const [trucks, setTrucks] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [capacityMin, setCapacityMin] = useState("");
  const [capacityMax, setCapacityMax] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [showForm, setShowForm] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [form, setForm] = useState({
    number: "",
    model: "",
    capacity: "",
    currentMileage: "",
  });

  // ✅ Mileage Prompt States
  const [showMileagePrompt, setShowMileagePrompt] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [truckRes, tripRes] = await Promise.all([
        axios.get("/api/trucks"),
        axios.get("/api/trips"),
      ]);

      setTrucks(Array.isArray(truckRes.data.data) ? truckRes.data.data : []);
      setTrips(Array.isArray(tripRes.data.data) ? tripRes.data.data : []);
    } catch (err) {
      console.error("Error fetching trucks or trips:", err);
      setTrucks([]);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Mileage Limit Check
  useEffect(() => {
    const overLimitTruck = trucks.find(
      (t) =>
        t.currentMileage >= 4000 &&
        !localStorage.getItem(`mileagePrompt_${t._id}`)
    );

    if (overLimitTruck) {
      setSelectedTruck(overLimitTruck);
      setShowMileagePrompt(true);
    }
  }, [trucks]);

  function calculateIncome(truckId) {
    let filteredTrips = trips.filter((t) => t.truck?._id === truckId);
    if (dateFrom)
      filteredTrips = filteredTrips.filter(
        (t) => new Date(t.date) >= new Date(dateFrom)
      );
    if (dateTo)
      filteredTrips = filteredTrips.filter(
        (t) => new Date(t.date) <= new Date(dateTo)
      );
    return filteredTrips.reduce((sum, t) => sum + (t.total_sale || 0), 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingTruck) {
        const res = await axios.put(`/api/trucks/${editingTruck._id}`, form);
        setTrucks((prev) =>
          Array.isArray(prev)
            ? prev.map((t) =>
                t._id === editingTruck._id ? res.data.data : t
              )
            : []
        );
      } else {
        const res = await axios.post("/api/trucks", form);
        setTrucks((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          res.data.data,
        ]);
      }

      setForm({ number: "", model: "", capacity: "", currentMileage: "" });
      setEditingTruck(null);
      setShowForm(false);
    } catch (err) {
      console.error("Error saving truck:", err);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this truck?")) return;

    try {
      const res = await axios.delete(`/api/trucks/${id}`);
      setTrucks((prev) =>
        Array.isArray(prev) ? prev.filter((t) => t._id !== id) : []
      );
    } catch (err) {
      console.error(
        "Error deleting truck:",
        err.response && err.response.data ? err.response.data : err.message
      );
    }
  }

  function handleEdit(truck) {
    setEditingTruck(truck);
    setForm({
      number: truck.number || "",
      model: truck.model || "",
      capacity: truck.capacity ?? "",
      currentMileage: truck.currentMileage ?? "",
    });
    setShowForm(true);
  }

  function getFilteredTrucks() {
    let filtered = [...trucks];

    if (search) {
      filtered = filtered.filter(
        (t) =>
          t.number?.toLowerCase().includes(search.toLowerCase()) ||
          t.model?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (capacityMin)
      filtered = filtered.filter(
        (t) => Number(t.capacity) >= Number(capacityMin)
      );
    if (capacityMax)
      filtered = filtered.filter(
        (t) => Number(t.capacity) <= Number(capacityMax)
      );

    if (sortKey) {
      filtered.sort((a, b) => {
        let valA =
          sortKey === "truckwiseIncome" ? calculateIncome(a._id) : a[sortKey];
        let valB =
          sortKey === "truckwiseIncome" ? calculateIncome(b._id) : b[sortKey];
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }

  function resetFilters() {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setCapacityMin("");
    setCapacityMax("");
    setSortKey("");
    setSortOrder("asc");
  }

  // ✅ Handle Save and Clear Mileage
  async function handleSaveMileage() {
    if (!selectedTruck) return;

    try {
      await axios.put(`/api/trucks/${selectedTruck._id}`, {
        ...selectedTruck,
        currentMileage: selectedTruck.currentMileage,
      });
      localStorage.setItem(`mileagePrompt_${selectedTruck._id}`, "saved");
      setShowMileagePrompt(false);
      setSelectedTruck(null);
    } catch (err) {
      console.error("Error saving mileage:", err);
    }
  }

  async function handleClearMileage() {
    if (!selectedTruck) return;

    try {
      await axios.put(`/api/trucks/${selectedTruck._id}`, {
        ...selectedTruck,
        currentMileage: 0,
      });
      localStorage.removeItem(`mileagePrompt_${selectedTruck._id}`);
      setTrucks((prev) =>
        prev.map((t) =>
          t._id === selectedTruck._id ? { ...t, currentMileage: 0 } : t
        )
      );
      setShowMileagePrompt(false);
      setSelectedTruck(null);
    } catch (err) {
      console.error("Error clearing mileage:", err);
    }
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-4 sm:p-6 mt-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Trucks
          </h1>
          <p className="text-sm text-gray-500">
            Manage trucks, capacities, mileage, and truckwise income records.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTruck(null);
            setForm({
              number: "",
              model: "",
              capacity: "",
              currentMileage: "",
            });
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm rounded-md transition-all"
        >
          + Add Truck
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-end flex-wrap bg-white p-4 rounded-lg shadow border">
        <input
          type="text"
          placeholder="Search by Number or Model"
          className="border p-2 rounded-md focus:ring-2 focus:ring-blue-600 outline-none flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Capacity"
          className="border p-2 rounded-md focus:ring-2 focus:ring-blue-600 w-28"
          value={capacityMin}
          onChange={(e) => setCapacityMin(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Capacity"
          className="border p-2 rounded-md focus:ring-2 focus:ring-blue-600 w-28"
          value={capacityMax}
          onChange={(e) => setCapacityMax(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded-md focus:ring-2 focus:ring-blue-600 w-36"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded-md focus:ring-2 focus:ring-blue-600 w-36"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <select
          className="border p-2 rounded-md focus:ring-2 focus:ring-blue-600 w-40"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="number">Truck Number</option>
          <option value="model">Truck Model</option>
          <option value="capacity">Capacity</option>
          <option value="truckwiseIncome">Truckwise Income</option>
        </select>
        <select
          className="border p-2 rounded-md focus:ring-2 focus:ring-blue-600 w-32"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
        <button
          className="px-3 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-sm"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {/* Trucks Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border p-2 text-left">Truck Number</th>
              <th className="border p-2 text-left">Truck Model</th>
              <th className="border p-2 text-center">Capacity</th>
              <th className="border p-2 text-center">Mileage</th>
              <th className="border p-2 text-center">Truckwise Income</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredTrucks().map((truck, index) => (
              <tr
                key={truck._id || truck.number || index}
                className="text-center hover:bg-gray-50 transition-all"
              >
                <td className="border p-2 text-left font-medium text-gray-800">
                  {truck.number || "N/A"}
                </td>
                <td className="border p-2 text-left text-gray-700">
                  {truck.model || "N/A"}
                </td>
                <td className="border p-2 text-gray-700">
                  {truck.capacity || 0}
                </td>
                <td className="border p-2 text-gray-700">
                  {truck.currentMileage || 0}
                </td>
                <td className="border p-2 text-gray-700">
                  {calculateIncome(truck._id)}
                </td>
                <td className="border p-2 flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(truck)}
                    className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs sm:text-sm transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(truck._id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs sm:text-sm transition-all"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {getFilteredTrucks().length === 0 && (
        <div className="p-6 text-center text-gray-500">
          No truck records found
        </div>
      )}

      {/* Truck Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTruck ? "Edit Truck" : "Add New Truck"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Truck Number
                </label>
                <input
                  type="text"
                  required
                  value={form.number || ""}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700"
                  placeholder="e.g., LHR-1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  required
                  value={form.model || ""}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700"
                  placeholder="e.g., Volvo FH16"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity (tons)
                </label>
                <input
                  type="number"
                  value={form.capacity || ""}
                  onChange={(e) =>
                    setForm({ ...form, capacity: e.target.value })
                  }
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700"
                  placeholder="e.g., 20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Mileage (km)
                </label>
                <input
                  type="number"
                  value={form.currentMileage || ""}
                  onChange={(e) =>
                    setForm({ ...form, currentMileage: e.target.value })
                  }
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700"
                  placeholder="e.g., 40000"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md transition-all"
                >
                  {editingTruck ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Mileage Limit Prompt */}
      {showMileagePrompt && selectedTruck && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center shadow-xl border">
            <h2 className="text-lg font-bold text-red-600 mb-3">
              ⚠️ Mileage Limit Exceeded
            </h2>
            <p className="text-gray-700 mb-5">
              Truck{" "}
              <span className="font-semibold">{selectedTruck.number}</span> has
              crossed the 4000 km limit.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleSaveMileage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Save Mileage
              </button>
              <button
                onClick={handleClearMileage}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Clear Mileage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
