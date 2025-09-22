"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [dealers, setDealers] = useState([]);
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

  useEffect(() => {
    fetchTrips();
    fetchDropdowns();
  }, []);

  const fetchTrips = async () => {
    const res = await axios.get("/api/trips");
    const data = res.data;
    setTrips(data);

    // 🧮 summary aggregation
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
  };

  const fetchDropdowns = async () => {
    const [driversRes, trucksRes, dealersRes] = await Promise.all([
      axios.get("/api/drivers"),
      axios.get("/api/trucks"),
      axios.get("/api/dealers"),
    ]);
    setDrivers(driversRes.data);
    setTrucks(trucksRes.data);
    setDealers(dealersRes.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/api/trips", form);
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
    fetchTrips(); // refresh table + summary
  };

  // 🚀 Delete trip
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await axios.delete(`/api/trips/${id}`);
      fetchTrips();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // 🚀 Edit trip (basic example: pickup form data into state)
  const handleEdit = (trip) => {
    setForm({
      driver: trip.driver?._id || "",
      truck: trip.truck?._id || "",
      dealer: trip.dealer?._id || "",
      date: trip.date ? trip.date.split("T")[0] : "",
      total_sale: trip.total_sale,
      amount_received: trip.amount_received,
      amount_pending: trip.amount_pending,
      expenses: trip.expenses,
      fuel_cost: trip.fuel_cost,
      other_expenses: trip.other_expenses,
      kilometres: trip.kilometres,
      total_income: trip.total_income,
    });
    // Optionally store editing id
    setEditingId(trip._id);
  };

  const [editingId, setEditingId] = useState(null);

  // If editing → use PUT instead of POST
  const handleSave = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`/api/trips/${editingId}`, form);
      setEditingId(null);
    } else {
      await axios.post("/api/trips", form);
    }
    setForm({
      driver: "",
      truck: "",
      dealer: "",
      date: "",
      total_sale: 0,
      amount_received: 0,
      amount_pending: 0,
      expenses: 0,
      fuel_cost: 0,
      other_expenses: 0,
      kilometres: 0,
      total_income: 0,
    });

    fetchTrips();
  };

  return (
    <div className="p-6">
      {/* 🔷 Top Summary Strip */}
      <div className="grid grid-cols-9 bg-blue-900 text-white font-semibold rounded-lg overflow-hidden text-center text-sm">
        <div className="p-2">
          Total Bill <br /> {summary.totalBill}
        </div>
        <div className="p-2">
          Amount Received <br /> {summary.amountReceived}
        </div>
        <div className="p-2">
          Amount Pending <br /> {summary.amountPending}
        </div>
        <div className="p-2">
          Expenses <br /> {summary.expenses}
        </div>
        <div className="p-2">
          Fuel Cost <br /> {summary.fuelCost}
        </div>
        <div className="p-2">
          Other Expenses <br /> {summary.otherExpenses}
        </div>
        <div className="p-2">
          Total Income <br /> {summary.totalIncome}
        </div>
        <div className="p-2">
          Driver Commission <br /> {summary.driverCommission}
        </div>
        <div className="p-2">
          Mileage <br /> {summary.mileage}
        </div>
      </div>

      {/* 📝 Add Trip Form (Middle) */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 p-6 bg-gray-100 rounded-lg max-w-4xl mx-auto"
      >
        <h2 className="text-lg font-semibold mb-4 text-center">Add New Trip</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="p-2 border rounded bg-white text-black"
          />

          <input
            type="number"
            name="total_sale"
            placeholder="Total Bill"
            value={form.total_sale}
            onChange={handleChange}
            className="p-2 border rounded bg-white text-black"
          />

          <input
            type="number"
            name="amount_received"
            placeholder="Amount Received"
            value={form.amount_received}
            onChange={handleChange}
            className="p-2 border rounded bg-white text-black"
          />

          <input
            type="number"
            name="amount_pending"
            placeholder="Amount Pending"
            value={form.amount_pending}
            onChange={handleChange}
            className="p-2 border rounded bg-white text-black"
          />

          <input
            type="number"
            name="expenses"
            placeholder="Expenses"
            value={form.expenses}
            onChange={handleChange}
            className="p-2 border rounded bg-white text-black"
          />

          <input
            type="number"
            name="fuel_cost"
            placeholder="Fuel Cost"
            value={form.fuel_cost}
            onChange={handleChange}
            className="p-2 border rounded bg-white text-black"
          />

          <input
            type="number"
            name="other_expenses"
            placeholder="Other Expenses"
            value={form.other_expenses}
            onChange={handleChange}
            className="p-2 border rounded bg-white text-black"
          />

          <input
            type="number"
            name="kilometres"
            placeholder="Mileage"
            value={form.kilometres}
            onChange={handleChange}
            className="p-2 border rounded bg-white text-black"
          />

          <input
            type="number"
            name="total_income"
            placeholder="Total Income"
            value={form.total_income}
            onChange={handleChange}
            className="p-2 border rounded bg-white text-black"
          />

          {/* Dropdowns */}
          <select
            name="driver"
            value={form.driver}
            onChange={handleChange}
            className="p-2 border rounded bg-white text-black"
          >
            <option value="">Select Driver</option>
            {drivers.map((d) => (
              <option key={d._id} value={d._id} className="bg-white text-black">
                {d.full_name}
              </option>
            ))}
          </select>


          <select
            name="truck"
            value={form.truck}
            onChange={handleChange}
            className="p-2 border rounded bg-white text-black"
          >
            <option value="">Select Truck</option>
            {trucks.map((t) => (
              <option key={t._id} value={t._id} className="bg-white text-black">
                {t.model}
              </option>
            ))}
          </select>


          <select
            name="dealer"
            value={form.dealer}
            onChange={handleChange}
            className="p-2 border rounded bg-white text-black"
          >
            <option value="" className="bg-white text-black">
              Select Dealer
            </option>
            {dealers.map((dl) => (
              <option key={dl._id} value={dl._id} className="bg-white text-black">
                {dl.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded"
          >
            Save Trip
          </button>
        </div>
      </form>

      {/* 📋 Trip Data Table (End) */}
      <div className="mt-10 overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-blue-900 text-white">
            <tr>
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
              <tr key={trip._id} className="text-center">
                <td className="p-2 border">
                  {new Date(trip.date).toLocaleDateString()}
                </td>
                <td className="p-2 border">{trip.total_sale}</td>
                <td className="p-2 border">{trip.amount_received}</td>
                <td className="p-2 border">{trip.amount_pending}</td>
                <td className="p-2 border">{trip.expenses}</td>
                <td className="p-2 border">{trip.fuel_cost}</td>
                <td className="p-2 border">{trip.other_expenses}</td>
                <td className="p-2 border">{trip.total_income}</td>
                <td className="p-2 border">{trip.driverCommission}</td>
                <td className="p-2 border">{trip.kilometres}</td>

                {/* 🔥 Fix: number → model */}
                <td className="p-2 border">{trip.truck?.model || "-"}</td>
                <td className="p-2 border">{trip.driver?.full_name || "-"}</td>
                <td className="p-2 border">{trip.dealer?.name || "-"}</td>

                <td className="p-2 border">
                  <button
                    onClick={() => handleEdit(trip)}
                    className="px-2 py-1 text-xs bg-yellow-500 text-white rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(trip._id)}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded"
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

  );
}
