"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import TruckingFinanceDashboard from "@/components/finance-dashboard";

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [activeTab, setActiveTab] = useState("trips");
  const [form, setForm] = useState({
    driver: "",
    truck: "",
    dealer: "",
    date: "",
    total_sale: "",
    amount_received: "",
    amount_pending: "",
    expenses: "",
    fuel_cost: "",
    other_expenses: "",
    kilometres: "",
    total_income: "",
  });

  const [summary, setSummary] = useState({
    totalBill: 0,
    amountReceived: 0,
    amountPending: 0,
    expenses: 0,
    fuelCost: 0,
    otherExpenses: 0,
    totalIncome: 0,
    driverCommission: 0,
    mileage: 0,
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTrips();
    fetchDropdowns();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await axios.get("/api/trips");
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setTrips(data);

      const totals = data.reduce(
        (acc, trip) => {
          acc.totalBill += trip.total_sale || 0;
          acc.amountReceived += trip.amount_received || 0;
          acc.amountPending += trip.amount_pending || 0;
          acc.expenses += trip.expenses || 0;
          acc.fuelCost += trip.fuel_cost || 0;
          acc.otherExpenses += trip.other_expenses || 0;
          acc.totalIncome += trip.total_income || 0;
          acc.driverCommission += trip.driverCommission || 0;
          acc.mileage += trip.kilometres || 0;
          return acc;
        },
        {
          totalBill: 0,
          amountReceived: 0,
          amountPending: 0,
          expenses: 0,
          fuelCost: 0,
          otherExpenses: 0,
          totalIncome: 0,
          driverCommission: 0,
          mileage: 0,
        }
      );

      setSummary(totals);
    } catch (err) {
      console.error("Error fetching trips:", err);
      setTrips([]);
    }
  };

  const fetchDropdowns = async () => {
  try {
    const [driversRes, trucksRes, dealersRes] = await Promise.all([
      axios.get("/api/drivers"),
      axios.get("/api/trucks"),
      axios.get("/api/dealers"),
    ]);

    console.log("Drivers Response:", driversRes.data); // Debug ke liye
    console.log("Trucks Response:", trucksRes.data);   // Debug ke liye
    console.log("Dealers Response:", dealersRes.data); // Debug ke liye

    // ✅ Fix: Driver response structure ko properly handle karen
    setDrivers(Array.isArray(driversRes.data) ? driversRes.data : 
               Array.isArray(driversRes.data.data) ? driversRes.data.data : 
               Array.isArray(driversRes.data.drivers) ? driversRes.data.drivers : []);

    setTrucks(Array.isArray(trucksRes.data) ? trucksRes.data : []);
    setDealers(Array.isArray(dealersRes.data) ? dealersRes.data : []);
  } catch (err) {
    console.error("Error fetching dropdowns:", err);
    setDrivers([]);
    setTrucks([]);
    setDealers([]);
  }
};
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/trips/${editingId}`, form);
        setEditingId(null);
      } else {
        await axios.post("/api/trips", form);
      }

      // Reset form
      setForm({
        driver: "",
        truck: "",
        dealer: "",
        date: "",
        total_sale: "",
        amount_received: "",
        amount_pending: "",
        expenses: "",
        fuel_cost: "",
        other_expenses: "",
        kilometres: "",
        total_income: "",
      });

      // Refresh data
      fetchTrips();
    } catch (err) {
      console.error("Error saving trip:", err);
      alert("Error saving trip. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await axios.delete(`/api/trips/${id}`);
      fetchTrips();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error deleting trip. Please try again.");
    }
  };

  const handleEdit = (trip) => {
    setForm({
      driver: trip.driver?._id || trip.driver || "",
      truck: trip.truck?._id || trip.truck || "",
      dealer: trip.dealer?._id || trip.dealer || "",
      date: trip.date ? trip.date.split("T")[0] : "",
      total_sale: trip.total_sale || "",
      amount_received: trip.amount_received || "",
      amount_pending: trip.amount_pending || "",
      expenses: trip.expenses || "",
      fuel_cost: trip.fuel_cost || "",
      other_expenses: trip.other_expenses || "",
      kilometres: trip.kilometres || "",
      total_income: trip.total_income || "",
    });
    setEditingId(trip._id);
  };

  return (
    <div className="p-4 sm:p-6 mt-10">
      {/* ✅ Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`px-6 py-3 font-medium text-sm ${activeTab === "trips"
              ? "border-b-2 border-blue-700 text-blue-700 font-semibold"
              : "text-gray-500 hover:text-gray-700"
            }`}
          onClick={() => setActiveTab("trips")}
        >
          Simple Trips View
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm ${activeTab === "dashboard"
              ? "border-b-2 border-blue-700 text-blue-700 font-semibold"
              : "text-gray-500 hover:text-gray-700"
            }`}
          onClick={() => setActiveTab("dashboard")}
        >
          Finance Dashboard
        </button>
      </div>

      {activeTab === "trips" ? (
        <>
          {/* 🔷 Top Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3 mt-4">
            <div className="bg-blue-700 text-white rounded-lg p-3 text-center shadow">
              <div className="text-xs sm:text-sm font-semibold">Total Bill</div>
              <div className="mt-1 text-lg sm:text-xl font-bold">{summary.totalBill.toLocaleString()}</div>
            </div>
            <div className="bg-blue-700 text-white rounded-lg p-3 text-center shadow">
              <div className="text-xs sm:text-sm font-semibold">Amount Received</div>
              <div className="mt-1 text-lg sm:text-xl font-bold">{summary.amountReceived.toLocaleString()}</div>
            </div>
            <div className="bg-blue-700 text-white rounded-lg p-3 text-center shadow">
              <div className="text-xs sm:text-sm font-semibold">Amount Pending</div>
              <div className="mt-1 text-lg sm:text-xl font-bold">{summary.amountPending.toLocaleString()}</div>
            </div>
            <div className="bg-blue-700 text-white rounded-lg p-3 text-center shadow">
              <div className="text-xs sm:text-sm font-semibold">Expenses</div>
              <div className="mt-1 text-lg sm:text-xl font-bold">{summary.expenses.toLocaleString()}</div>
            </div>
            <div className="bg-blue-700 text-white rounded-lg p-3 text-center shadow">
              <div className="text-xs sm:text-sm font-semibold">Fuel Cost</div>
              <div className="mt-1 text-lg sm:text-xl font-bold">{summary.fuelCost.toLocaleString()}</div>
            </div>
            <div className="bg-blue-700 text-white rounded-lg p-3 text-center shadow">
              <div className="text-xs sm:text-sm font-semibold">Other Expenses</div>
              <div className="mt-1 text-lg sm:text-xl font-bold">{summary.otherExpenses.toLocaleString()}</div>
            </div>
            <div className="bg-blue-700 text-white rounded-lg p-3 text-center shadow">
              <div className="text-xs sm:text-sm font-semibold">Total Income</div>
              <div className="mt-1 text-lg sm:text-xl font-bold">{summary.totalIncome.toLocaleString()}</div>
            </div>
            <div className="bg-blue-700 text-white rounded-lg p-3 text-center shadow">
              <div className="text-xs sm:text-sm font-semibold">Driver Commission</div>
              <div className="mt-1 text-lg sm:text-xl font-bold">{summary.driverCommission.toLocaleString()}</div>
            </div>
            <div className="bg-blue-700 text-white rounded-lg p-3 text-center shadow">
              <div className="text-xs sm:text-sm font-semibold">Mileage</div>
              <div className="mt-1 text-lg sm:text-xl font-bold">{summary.mileage.toLocaleString()}</div>
            </div>
          </div>

          {/* 📝 Add Trip Form */}
          <form onSubmit={handleSubmit} className="mt-6 p-4 sm:p-6 bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center text-gray-900">
              {editingId ? "Edit Trip" : "Add New Trip"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <input type="date" name="date" value={form.date} onChange={handleChange} className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" required />
              <input type="number" name="total_sale" placeholder="Total Bill" value={form.total_sale} onChange={handleChange} className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" required />
              <input type="number" name="amount_received" placeholder="Amount Received" value={form.amount_received} onChange={handleChange} className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" required />
              <input type="number" name="amount_pending" placeholder="Amount Pending" value={form.amount_pending} onChange={handleChange} className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" required />
              <input type="number" name="expenses" placeholder="Expenses" value={form.expenses} onChange={handleChange} className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" />
              <input type="number" name="fuel_cost" placeholder="Fuel Cost" value={form.fuel_cost} onChange={handleChange} className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" />
              <input type="number" name="other_expenses" placeholder="Other Expenses" value={form.other_expenses} onChange={handleChange} className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" />
              <input type="number" name="kilometres" placeholder="Mileage" value={form.kilometres} onChange={handleChange} className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" />
              <input type="number" name="total_income" placeholder="Total Income" value={form.total_income} onChange={handleChange} className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" required />

             {/* ✅ Fixed Driver Dropdown */}
<select name="driver" value={form.driver} onChange={handleChange} className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" required>
  <option value="">Select Driver</option>
  {console.log("Drivers data:", drivers)} {/* Add this line */}
  {drivers.map((d) => (
    <option key={d._id} value={d._id}>{d.full_name || d.name}</option>
  ))}
</select>

              <select name="truck" value={form.truck} onChange={handleChange} className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" required>
                <option value="">Select Truck</option>
                {trucks.map((t) => (
                  <option key={t._id} value={t._id}>{t.model || t.number || t.name}</option>
                ))}
              </select>

              <select name="dealer" value={form.dealer} onChange={handleChange} className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" required>
                <option value="">Select Dealer</option>
                {dealers.map((dl) => (
                  <option key={dl._id} value={dl._id}>{dl.name || dl.dealer_name}</option>
                ))}
              </select>
            </div>

            <div className="text-center mt-4">
              <button type="submit" className="px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-all">
                {editingId ? "Update Trip" : "Save Trip"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      driver: "", truck: "", dealer: "", date: "", total_sale: "", amount_received: "",
                      amount_pending: "", expenses: "", fuel_cost: "", other_expenses: "",
                      kilometres: "", total_income: ""
                    });
                  }}
                  className="ml-3 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* 📋 Trip Data Table */}
          <div className="mt-6 sm:mt-10 overflow-x-auto bg-white rounded-lg shadow-sm border">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-blue-700 text-white">
                <tr className="text-center text-xs sm:text-sm">
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Total Bill</th>
                  <th className="p-2 border">Amount Received</th>
                  <th className="p-2 border">Amount Pending</th>
                  <th className="p-2 border">Expenses</th>
                  <th className="p-2 border">Fuel Cost</th>
                  <th className="p-2 border">Other Expense</th>
                  <th className="p-2 border">Total Income</th>
                  <th className="p-2 border">Driver Commission</th>
                  <th className="p-2 border">Milage</th>
                  <th className="p-2 border">Truck No.</th>
                  <th className="p-2 border">Driver Name</th>
                  <th className="p-2 border">Dealer Name</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip._id} className="text-center hover:bg-gray-50 transition-all text-xs sm:text-sm">
                    <td className="p-2 border">{trip.date ? new Date(trip.date).toLocaleDateString() : "-"}</td>
                    <td className="p-2 border">{trip.total_sale?.toLocaleString()}</td>
                    <td className="p-2 border">{trip.amount_received?.toLocaleString()}</td>
                    <td className="p-2 border">{trip.amount_pending?.toLocaleString()}</td>
                    <td className="p-2 border">{trip.expenses?.toLocaleString()}</td>
                    <td className="p-2 border">{trip.fuel_cost?.toLocaleString()}</td>
                    <td className="p-2 border">{trip.other_expenses?.toLocaleString()}</td>
                    <td className="p-2 border">{trip.total_income?.toLocaleString()}</td>
                    <td className="p-2 border">{trip.driverCommission?.toLocaleString() || "0"}</td>
                    <td className="p-2 border">{trip.kilometres?.toLocaleString()}</td>
                    <td className="p-2 border">{trip.truck?.model || trip.truck?.number || "-"}</td>
                    <td className="p-2 border">{trip.driver?.full_name || trip.driver?.name || "-"}</td>
                    <td className="p-2 border">{trip.dealer?.name || trip.dealer?.dealer_name || "-"}</td>
                    <td className="p-2 border flex justify-center gap-1">
                      <button onClick={() => handleEdit(trip)} className="px-2 py-1 bg-yellow-500 text-white rounded text-xs sm:text-sm hover:bg-yellow-600 transition-all">Edit</button>
                      <button onClick={() => handleDelete(trip._id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs sm:text-sm hover:bg-red-700 transition-all">Delete</button>
                    </td>
                  </tr>
                ))}
                {trips.length === 0 && (
                  <tr>
                    <td colSpan="14" className="p-4 text-center text-gray-500">
                      No trips found. Add your first trip above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <TruckingFinanceDashboard
          trips={trips}
          drivers={drivers}
          trucks={trucks}
          dealers={dealers}
          onTripUpdate={fetchTrips}
        />
      )}
    </div>
  );
}