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
    expenses: "",
    fuel_cost: "",
    other_expenses: "",
    kilometres: "",
  });
  const [editingId, setEditingId] = useState(null);
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

  // ✅ Fetch trips & dropdown data
  useEffect(() => {
    fetchTrips();
    fetchDropdowns();
  }, []);

  // ----------------------- FETCH FUNCTIONS -----------------------
  const fetchTrips = async () => {
    try {
      const res = await axios.get("/api/trips");
      const data = Array.isArray(res.data.data) ? res.data.data : [];

      const tripsWithCalc = data.map((t) => {
        const pending = (t.total_sale || 0) - (t.amount_received || 0);
        const commission = (t.total_sale || 0) * 0.1;
        const totalIncome = (t.amount_received || 0) - (t.expenses || 0) - (t.fuel_cost || 0) - (t.other_expenses || 0) - commission;
        return { ...t, amount_pending: pending, driverCommission: commission, total_income: totalIncome };
      });

      setTrips(tripsWithCalc);

      // Update summary
      const totals = tripsWithCalc.reduce(
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
        { ...summary }
      );
      setSummary(totals);
    } catch (err) {
      console.error("Error fetching trips:", err);
      setTrips([]);
    }
  };

  // ✅ FIXED DROPDOWNS FUNCTION
  const fetchDropdowns = async () => {
    try {
      const [driversRes, trucksRes, dealersRes] = await Promise.all([
        axios.get("/api/drivers"),
        axios.get("/api/trucks"),
        axios.get("/api/dealers"),
      ]);

      // ✅ Drivers: { success: true, data: [...] }
      const driversData = driversRes.data.success && Array.isArray(driversRes.data.data) 
        ? driversRes.data.data 
        : [];

      // ✅ Trucks & Dealers: check their format
      const trucksData = Array.isArray(trucksRes.data.data) ? trucksRes.data.data : 
                        Array.isArray(trucksRes.data) ? trucksRes.data : [];
      
      const dealersData = Array.isArray(dealersRes.data.data) ? dealersRes.data.data : 
                         Array.isArray(dealersRes.data) ? dealersRes.data : [];

      console.log("Drivers loaded:", driversData.length);
      console.log("Trucks loaded:", trucksData.length);
      console.log("Dealers loaded:", dealersData.length);

      setDrivers(driversData);
      setTrucks(trucksData);
      setDealers(dealersData);
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
      setDrivers([]);
      setTrucks([]);
      setDealers([]);
    }
  };

  // ----------------------- FORM HANDLERS -----------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pending = (form.total_sale || 0) - (form.amount_received || 0);
    const commission = (form.total_sale || 0) * 0.1;
    const totalIncome = (form.amount_received || 0) - (form.expenses || 0) - (form.fuel_cost || 0) - (form.other_expenses || 0) - commission;

    const payload = {
      ...form,
      amount_pending: pending,
      driverCommission: commission,
      total_income: totalIncome,
    };

    try {
      if (editingId) {
        await axios.put(`/api/trips/${editingId}`, payload);
        setEditingId(null);
      } else {
        await axios.post("/api/trips", payload);
      }
      // Reset form
      setForm({
        driver: "",
        truck: "",
        dealer: "",
        date: "",
        total_sale: "",
        amount_received: "",
        expenses: "",
        fuel_cost: "",
        other_expenses: "",
        kilometres: "",
      });
      fetchTrips();
    } catch (err) {
      console.error("Error saving trip:", err);
      alert("Error saving trip. Try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await axios.delete(`/api/trips/${id}`);
      fetchTrips();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error deleting trip. Try again.");
    }
  };

  // ✅ FIXED EDIT FUNCTION
  const handleEdit = (trip) => {
    setForm({
      driver: trip.driver?._id || trip.driver || "",
      truck: trip.truck?._id || trip.truck || "",
      dealer: trip.dealer?._id || trip.dealer || "",
      date: trip.date ? trip.date.split("T")[0] : "",
      total_sale: trip.total_sale || "",
      amount_received: trip.amount_received || "",
      expenses: trip.expenses || "",
      fuel_cost: trip.fuel_cost || "",
      other_expenses: trip.other_expenses || "",
      kilometres: trip.kilometres || "",
    });
    setEditingId(trip._id);
  };

  return (
    <div className="p-4 sm:p-6 mt-10">
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-6 py-3 font-medium text-sm ${activeTab === "trips" ? "border-b-2 border-blue-700 text-blue-700 font-semibold" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("trips")}
        >
          Trips
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm ${activeTab === "dashboard" ? "border-b-2 border-blue-700 text-blue-700 font-semibold" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Finance Dashboard
        </button>
      </div>

      {activeTab === "trips" ? (
        <>
          {/* Sticky Summary Cards */}
          <div className="sticky top-0 z-20 bg-white p-4 sm:p-6 shadow">
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3">
              {Object.entries(summary).map(([key, value]) => (
                <div key={key} className="bg-blue-700 text-white rounded-lg p-3 text-center shadow">
                  <div className="text-xs sm:text-sm font-semibold">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="mt-1 text-lg sm:text-xl font-bold">{value.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Add/Edit Trip Form */}
          <form onSubmit={handleSubmit} className="mt-4 p-4 sm:p-6 bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">{editingId ? "Edit Trip" : "Add New Trip"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <input type="date" name="date" value={form.date} onChange={handleChange} required className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" />
              <input type="number" name="total_sale" placeholder="Total Bill" value={form.total_sale} onChange={handleChange} required className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" />
              <input type="number" name="amount_received" placeholder="Amount Received" value={form.amount_received} onChange={handleChange} required className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" />
              <input type="number" name="expenses" placeholder="Expenses" value={form.expenses} onChange={handleChange} className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" />
              <input type="number" name="fuel_cost" placeholder="Fuel Cost" value={form.fuel_cost} onChange={handleChange} className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" />
              <input type="number" name="other_expenses" placeholder="Other Expenses" value={form.other_expenses} onChange={handleChange} className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" />
              <input type="number" name="kilometres" placeholder="Mileage" value={form.kilometres} onChange={handleChange} className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700" />

              {/* ✅ DRIVER DROPDOWN - FIXED */}
              <select
                name="driver"
                value={form.driver}
                onChange={handleChange}
                required
                className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700"
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.full_name} - {driver.license_no}
                  </option>
                ))}
              </select>

              <select name="truck" value={form.truck} onChange={handleChange} required className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700">
                <option value="">Select Truck</option>
                {trucks.map((truck) => (
                  <option key={truck._id} value={truck._id}>
                    {truck.model || truck.number}
                  </option>
                ))}
              </select>

              <select name="dealer" value={form.dealer} onChange={handleChange} required className="p-2 border rounded-md focus:ring-2 focus:ring-blue-700">
                <option value="">Select Dealer</option>
                {dealers.map((dealer) => (
                  <option key={dealer._id} value={dealer._id}>
                    {dealer.name}
                  </option>
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
                      driver: "", truck: "", dealer: "", date: "", 
                      total_sale: "", amount_received: "", expenses: "", 
                      fuel_cost: "", other_expenses: "", kilometres: "" 
                    }); 
                  }} 
                  className="ml-3 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Trips Table */}
          <div className="mt-4 sm:mt-6 overflow-x-auto max-h-[70vh] bg-white rounded-lg shadow-sm border">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-blue-700 text-white sticky top-0 z-10">
                <tr className="text-center text-xs sm:text-sm">
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Driver</th>
                  <th className="p-2 border">Truck</th>
                  <th className="p-2 border">Dealer</th>
                  <th className="p-2 border">Total Bill</th>
                  <th className="p-2 border">Amount Received</th>
                  <th className="p-2 border">Amount Pending</th>
                  <th className="p-2 border">Driver Commission</th>
                  <th className="p-2 border">Expenses</th>
                  <th className="p-2 border">Fuel Cost</th>
                  <th className="p-2 border">Other Expenses</th>
                  <th className="p-2 border">Mileage</th>
                  <th className="p-2 border">Total Income</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip._id} className="text-center hover:bg-gray-50 transition-all text-xs sm:text-sm">
                    <td className="p-2 border">{trip.date ? new Date(trip.date).toLocaleDateString() : "-"}</td>
                    <td className="p-2 border">{trip.driver?.full_name || "-"}</td>
                    <td className="p-2 border">{trip.truck?.model || trip.truck?.number || "-"}</td>
                    <td className="p-2 border">{trip.dealer?.name || "-"}</td>
                    <td className="p-2 border">{trip.total_sale?.toLocaleString()}</td>
                    <td className="p-2 border">{trip.amount_received?.toLocaleString()}</td>
                    <td className="p-2 border">{trip.amount_pending?.toLocaleString()}</td>
                    <td className="p-2 border">{trip.driverCommission?.toLocaleString()}</td>
                    <td className="p-2 border">{trip.expenses?.toLocaleString()}</td>
                    <td className="p-2 border">{trip.fuel_cost?.toLocaleString()}</td>
                    <td className="p-2 border">{trip.other_expenses?.toLocaleString()}</td>
                    <td className="p-2 border">{trip.kilometres?.toLocaleString()}</td>
                    <td className="p-2 border">{trip.total_income?.toLocaleString()}</td>
                    <td className="p-2 border flex justify-center gap-1">
                      <button onClick={() => handleEdit(trip)} className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-all text-xs sm:text-sm">Edit</button>
                      <button onClick={() => handleDelete(trip._id)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-all text-xs sm:text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <TruckingFinanceDashboard trips={trips} drivers={drivers} trucks={trucks} dealers={dealers} onTripUpdate={fetchTrips} />
      )}
    </div>
  );
}