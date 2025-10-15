"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function TruckingFinanceDashboard({ 
  trips: externalTrips = [], 
  drivers: externalDrivers = [], 
  trucks: externalTrucks = [], 
  dealers: externalDealers = [],
  onTripUpdate = () => {} 
}) {
  const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Use external data if provided, otherwise use internal state
  const [internalTrips, setInternalTrips] = useState([]);
  const [internalDrivers, setInternalDrivers] = useState([]);
  const [internalTrucks, setInternalTrucks] = useState([]);
  const [internalDealers, setInternalDealers] = useState([]);

  const trips = externalTrips.length > 0 ? externalTrips : internalTrips;
  const drivers = externalDrivers.length > 0 ? externalDrivers : internalDrivers;
  const trucks = externalTrucks.length > 0 ? externalTrucks : internalTrucks;
  const dealers = externalDealers.length > 0 ? externalDealers : internalDealers;

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [form, setForm] = useState({
    date: "",
    total_sale: "",
    amount_received: "",
    amount_pending: "",
    expenses: "",
    fuel_cost: "",
    other_expenses: "",
    kilometres: "",
    total_income: "",
    driver: "",
    truck: "",
    dealer: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    // Only fetch if no external data provided
    if (externalTrips.length === 0) {
      fetchAll();
    }
  }, [externalTrips.length]);

  const fetchAll = async () => {
    try {
      const [tripsRes, driversRes, trucksRes, dealersRes] = await Promise.all([
        axios.get("/api/trips"),
        axios.get("/api/drivers"),
        axios.get("/api/trucks"),
        axios.get("/api/dealers"),
      ]);

      setInternalTrips(Array.isArray(tripsRes.data) ? tripsRes.data : []);
      setInternalDrivers(Array.isArray(driversRes.data) ? driversRes.data : []);
      setInternalTrucks(Array.isArray(trucksRes.data) ? trucksRes.data : []);
      setInternalDealers(Array.isArray(dealersRes.data) ? dealersRes.data : []);
    } catch (err) {
      console.error("fetch failed", err);
    }
  };

  // Filter trips by selected month/year
  const filteredTrips = useMemo(() => {
    if (!Array.isArray(trips)) return [];
    return trips.filter((t) => {
      if (!t.date) return false;
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === Number(selectedYear);
    });
  }, [trips, selectedMonth, selectedYear]);

  // Summary aggregation
  const summary = useMemo(() => {
    return filteredTrips.reduce(
      (acc, trip) => {
        acc.totalBill += Number(trip.total_sale || 0);
        acc.amountReceived += Number(trip.amount_received || 0);
        acc.amountPending += Number(trip.amount_pending || 0);
        acc.expenses += Number(trip.expenses || 0);
        acc.fuelCost += Number(trip.fuel_cost || 0);
        acc.otherExpenses += Number(trip.other_expenses || 0);
        acc.totalIncome += Number(trip.total_income || 0);
        acc.driverCommission += Number(trip.driverCommission || 0);
        acc.mileage += Number(trip.kilometres || 0);
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
  }, [filteredTrips]);

  // Group trips by day
  const tripsByDay = useMemo(() => {
    const map = {};
    filteredTrips.forEach((t) => {
      const day = t.date ? new Date(t.date).toISOString().split("T")[0] : "unknown";
      if (!map[day]) map[day] = [];
      map[day].push(t);
    });
    return Object.keys(map)
      .sort((a, b) => new Date(b) - new Date(a))
      .map((k) => ({ day: k, trips: map[k] }));
  }, [filteredTrips]);

  // handlers
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/trips/${editingId}`, {
          ...form,
          month: selectedMonth,
          year: selectedYear,
        });
        setEditingId(null);
      } else {
        const res = await axios.post("/api/trips", {
          ...form,
          month: selectedMonth,
          year: selectedYear,
        });
        // ✅ instantly show the new trip without needing reload
        setInternalTrips((prev) => [...prev, res.data]);
      }

      setForm({
        date: "",
        total_sale: "",
        amount_received: "",
        amount_pending: "",
        expenses: "",
        fuel_cost: "",
        other_expenses: "",
        kilometres: "",
        total_income: "",
        driver: "",
        truck: "",
        dealer: "",
      });

      // ✅ Notify parent component about update
      onTripUpdate();
      
      // Refresh local data if using internal state
      if (externalTrips.length === 0) {
        fetchAll();
      }
    } catch (err) {
      console.error("save failed", err);
      alert("Error saving trip. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await axios.delete(`/api/trips/${id}`);
      setInternalTrips((prev) => prev.filter((t) => t._id !== id));
      
      // ✅ Notify parent component about update
      onTripUpdate();
    } catch (err) {
      console.error("delete failed", err);
      alert("Error deleting trip. Please try again.");
    }
  };

  const handleEdit = (trip) => {
    setForm({
      date: trip.date ? trip.date.split("T")[0] : "",
      total_sale: trip.total_sale || "",
      amount_received: trip.amount_received || "",
      amount_pending: trip.amount_pending || "",
      expenses: trip.expenses || "",
      fuel_cost: trip.fuel_cost || "",
      other_expenses: trip.other_expenses || "",
      kilometres: trip.kilometres || "",
      total_income: trip.total_income || "",
      driver: trip.driver?._id || trip.driver || "",
      truck: trip.truck?._id || trip.truck || "",
      dealer: trip.dealer?._id || trip.dealer || "",
    });
    setEditingId(trip._id);
  };

  // export handlers
  const exportPDFMonth = () => {
    alert("Export PDF (month) — implement on server side or use client library");
  };
  
  const exportPDFYear = () => {
    alert("Export PDF (year) — implement on server side or use client library");
  };
  
  const exportCSVMonth = () => {
    if (filteredTrips.length === 0) {
      alert("No data to export");
      return;
    }
    
    const rows = filteredTrips.map((t) => ({
      date: t.date,
      total_sale: t.total_sale,
      amount_received: t.amount_received,
      amount_pending: t.amount_pending,
      expenses: t.expenses,
      fuel_cost: t.fuel_cost,
      other_expenses: t.other_expenses,
      total_income: t.total_income,
      truck: t.truck?.model || t.truck?.number || "",
      driver: t.driver?.full_name || t.driver?.name || "",
      dealer: t.dealer?.name || "",
    }));
    
    const csv = [Object.keys(rows[0]).join(",")]
      .concat(rows.map((r) => Object.values(r).join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trips_${MONTHS[selectedMonth]}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Trucking Finance Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Manage monthly and yearly finances — filter, edit, and export with ease.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Year dropdown (2025-2050) */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="p-2 border rounded-md text-sm bg-white shadow-sm"
          >
            {Array.from({ length: 26 }).map((_, idx) => {
              const y = 2025 + idx;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>

          <button
            onClick={exportPDFMonth}
            className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm rounded-md transition-all"
          >
            PDF (Month)
          </button>
          <button
            onClick={exportPDFYear}
            className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm rounded-md transition-all"
          >
            PDF (Year)
          </button>
          <button
            onClick={exportCSVMonth}
            className="px-3 py-2 border text-sm rounded-md hover:bg-gray-100 transition-all"
          >
            CSV (Month)
          </button>
          <button
            onClick={() => alert("CSV (Year) — implement as needed")}
            className="px-3 py-2 border text-sm rounded-md hover:bg-gray-100 transition-all"
          >
            CSV (Year)
          </button>
        </div>
      </div>

      {/* Month Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {MONTHS.map((m, i) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(i)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
              i === selectedMonth
                ? "bg-blue-700 text-white shadow-sm"
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <div className="text-xs text-gray-500">
            {MONTHS[selectedMonth]} {selectedYear} • Total Bill
          </div>
          <div className="text-2xl font-bold mt-2">{summary.totalBill.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <div className="text-xs text-gray-500">
            {MONTHS[selectedMonth]} {selectedYear} • Total Income
          </div>
          <div className="text-2xl font-bold mt-2">{summary.totalIncome.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <div className="text-xs text-gray-500">
            {MONTHS[selectedMonth]} {selectedYear} • Total Expenses
          </div>
          <div className="text-2xl font-bold mt-2">{summary.expenses.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <div className="text-xs text-gray-500">
            {MONTHS[selectedMonth]} {selectedYear} • Pending
          </div>
          <div className="text-2xl font-bold mt-2">{summary.amountPending.toLocaleString()}</div>
        </div>
      </div>

     
      {/* Trips table */}
      <div>
        {tripsByDay.map((group) => (
          <div key={group.day} className="mb-6 bg-white rounded-lg shadow-sm border p-4">
            <h4 className="font-semibold mb-3 text-gray-800">Day: {group.day}</h4>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Truck No.</th>
                    <th className="p-2 border">Driver</th>
                    <th className="p-2 border">Dealer</th>
                    <th className="p-2 border">Mileage</th>
                    <th className="p-2 border">Total Bill</th>
                    <th className="p-2 border">Amount Received</th>
                    <th className="p-2 border">Pending</th>
                    <th className="p-2 border">Expenses</th>
                    <th className="p-2 border">Fuel</th>
                    <th className="p-2 border">Other</th>
                    <th className="p-2 border">Total Income</th>
                    <th className="p-2 border">Commission</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.trips.map((trip) => (
                    <tr key={trip._id} className="text-center hover:bg-gray-50">
                      <td className="p-2 border">
                        {trip.date ? new Date(trip.date).toISOString().split("T")[0] : "-"}
                      </td>
                      <td className="p-2 border">
                        {trip.truck?.model || trip.truck?.number || "-"}
                      </td>
                      <td className="p-2 border">{trip.driver?.full_name || trip.driver?.name || "-"}</td>
                      <td className="p-2 border">{trip.dealer?.name || "-"}</td>
                      <td className="p-2 border">{trip.kilometres?.toLocaleString()}</td>
                      <td className="p-2 border">{trip.total_sale?.toLocaleString()}</td>
                      <td className="p-2 border">{trip.amount_received?.toLocaleString()}</td>
                      <td className="p-2 border">{trip.amount_pending?.toLocaleString()}</td>
                      <td className="p-2 border">{trip.expenses?.toLocaleString()}</td>
                      <td className="p-2 border">{trip.fuel_cost?.toLocaleString()}</td>
                      <td className="p-2 border">{trip.other_expenses?.toLocaleString()}</td>
                      <td className="p-2 border">{trip.total_income?.toLocaleString()}</td>
                      <td className="p-2 border">{trip.driverCommission?.toLocaleString() || "0"}</td>
                      <td className="p-2 border">
                        <button
                          onClick={() => handleEdit(trip)}
                          className="px-2 py-1 text-xs bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600 transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(trip._id)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {tripsByDay.length === 0 && (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg border">
            No trips for {MONTHS[selectedMonth]} {selectedYear}
          </div>
        )}
      </div>
    </div>
  );return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="text-center md:text-left">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Trucking Finance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage monthly and yearly finances
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Year dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="p-2 border rounded-md text-sm bg-white shadow-sm"
          >
            {Array.from({ length: 26 }).map((_, idx) => {
              const y = 2025 + idx;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>

          {/* Export buttons grid */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <button
              onClick={exportPDFMonth}
              className="px-2 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm rounded-md transition-all"
            >
              PDF (Month)
            </button>
            <button
              onClick={exportPDFYear}
              className="px-2 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm rounded-md transition-all"
            >
              PDF (Year)
            </button>
            <button
              onClick={exportCSVMonth}
              className="px-2 py-2 border text-xs sm:text-sm rounded-md hover:bg-gray-100 transition-all"
            >
              CSV (Month)
            </button>
            <button
              onClick={() => alert("CSV (Year) — implement as needed")}
              className="px-2 py-2 border text-xs sm:text-sm rounded-md hover:bg-gray-100 transition-all"
            >
              CSV (Year)
            </button>
          </div>
        </div>
      </div>

      {/* Month Tabs - Horizontal Scroll */}
      <div className="overflow-x-auto mb-6">
        <div className="flex gap-2 min-w-max pb-2">
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(i)}
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex-shrink-0 ${
                i === selectedMonth
                  ? "bg-blue-700 text-white shadow-sm"
                  : "bg-white border hover:bg-gray-50"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards - 2 columns on mobile */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 bg-white rounded-lg shadow-sm border">
          <div className="text-xs text-gray-500 mb-1">Total Bill</div>
          <div className="text-lg sm:text-xl font-bold">{summary.totalBill.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-white rounded-lg shadow-sm border">
          <div className="text-xs text-gray-500 mb-1">Total Income</div>
          <div className="text-lg sm:text-xl font-bold">{summary.totalIncome.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-white rounded-lg shadow-sm border">
          <div className="text-xs text-gray-500 mb-1">Total Expenses</div>
          <div className="text-lg sm:text-xl font-bold">{summary.expenses.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-white rounded-lg shadow-sm border">
          <div className="text-xs text-gray-500 mb-1">Pending</div>
          <div className="text-lg sm:text-xl font-bold">{summary.amountPending.toLocaleString()}</div>
        </div>
      </div>

      {/* Trips table - Mobile optimized */}
      <div>
        {tripsByDay.map((group) => (
          <div key={group.day} className="mb-4 bg-white rounded-lg shadow-sm border p-3">
            <h4 className="font-semibold mb-3 text-gray-800 text-sm">Day: {group.day}</h4>
            <div className="overflow-x-auto -mx-3">
              <div className="min-w-full inline-block align-middle">
                <table className="w-full border text-xs">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-1 sm:p-2 border text-left">Date</th>
                      <th className="p-1 sm:p-2 border text-left">Truck</th>
                      <th className="p-1 sm:p-2 border text-left">Driver</th>
                      <th className="p-1 sm:p-2 border text-left">Bill</th>
                      <th className="p-1 sm:p-2 border text-left">Received</th>
                      <th className="p-1 sm:p-2 border text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.trips.map((trip) => (
                      <tr key={trip._id} className="hover:bg-gray-50">
                        <td className="p-1 sm:p-2 border text-xs">
                          {trip.date ? new Date(trip.date).toISOString().split("T")[0] : "-"}
                        </td>
                        <td className="p-1 sm:p-2 border">
                          <div className="text-xs">{trip.truck?.model || trip.truck?.number || "-"}</div>
                        </td>
                        <td className="p-1 sm:p-2 border">
                          <div className="text-xs">{trip.driver?.full_name || trip.driver?.name || "-"}</div>
                        </td>
                        <td className="p-1 sm:p-2 border">
                          <div className="text-xs font-medium">{trip.total_sale?.toLocaleString()}</div>
                        </td>
                        <td className="p-1 sm:p-2 border">
                          <div className="text-xs">{trip.amount_received?.toLocaleString()}</div>
                        </td>
                        <td className="p-1 sm:p-2 border">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleEdit(trip)}
                              className="px-1 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(trip._id)}
                              className="px-1 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Expanded details for mobile - Show additional info when trip is selected */}
            {group.trips.map((trip) => (
              <div key={trip._id} className="mt-2 p-2 bg-gray-50 rounded text-xs hidden sm:block">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Dealer:</span> {trip.dealer?.name || "-"}</div>
                  <div><span className="font-medium">Mileage:</span> {trip.kilometres?.toLocaleString()}</div>
                  <div><span className="font-medium">Pending:</span> {trip.amount_pending?.toLocaleString()}</div>
                  <div><span className="font-medium">Expenses:</span> {trip.expenses?.toLocaleString()}</div>
                  <div><span className="font-medium">Fuel:</span> {trip.fuel_cost?.toLocaleString()}</div>
                  <div><span className="font-medium">Other:</span> {trip.other_expenses?.toLocaleString()}</div>
                  <div><span className="font-medium">Income:</span> {trip.total_income?.toLocaleString()}</div>
                  <div><span className="font-medium">Commission:</span> {trip.driverCommission?.toLocaleString() || "0"}</div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {tripsByDay.length === 0 && (
          <div className="p-4 text-center text-gray-500 bg-white rounded-lg border text-sm">
            No trips for {MONTHS[selectedMonth]} {selectedYear}
          </div>
        )}
      </div>
    </div>
  );
}