"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    total_bill: "",
    amount: "",
    amountType: "received",
    expenses: "",
    fuel_cost: "",
    other_expenses: "",
    truck_id: "",
    driver_id: "",
    dealer_id: "",
    milage_km: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [tripRes, truckRes, driverRes, dealerRes] = await Promise.all([
          axios.get("/api/trips"),
          axios.get("/api/trucks"),
          axios.get("/api/drivers"),
          axios.get("/api/dealers"),
        ]);
        setTrips(tripRes.data);
        setTrucks(truckRes.data);
        setDrivers(driverRes.data);
        setDealers(dealerRes.data);
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const n = (val) => Number(val) || 0;
  const money = (val) => `Rs ${val.toLocaleString()}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        date: form.date,
        total_sale: n(form.total_bill),
        amount: n(form.amount),
        amount_received: form.amountType === "received" ? n(form.amount) : 0,
        amount_pending: form.amountType === "pending" ? n(form.amount) : 0,
        expenses: n(form.expenses),
        fuel_cost: n(form.fuel_cost),
        other_expenses: n(form.other_expenses),
        kilometres: n(form.milage_km),
        total_income:
          n(form.total_bill) - n(form.expenses) - n(form.fuel_cost) - n(form.other_expenses),
        driverCommission: Math.round((n(form.total_bill) - n(form.expenses)) * 0.1),
        truck: form.truck_id,
        driver: form.driver_id,
        dealer: form.dealer_id,
      };

      const res = await axios.post("/api/trips", payload);
      setTrips([...trips, res.data]);
      setForm({
        date: new Date().toISOString().slice(0, 10),
        total_bill: "",
        amount: "",
        amountType: "received",
        expenses: "",
        fuel_cost: "",
        other_expenses: "",
        truck_id: "",
        driver_id: "",
        dealer_id: "",
        milage_km: "",
      });
    } catch (err) {
      console.error("Error saving trip", err);
    } finally {
      setSaving(false);
    }
  };

  const totalSale = trips.reduce((sum, t) => sum + n(t.total_sale), 0);
  const totalExpenses = trips.reduce((sum, t) => sum + n(t.expenses) + n(t.fuel_cost) + n(t.other_expenses), 0);
  const totalIncome = trips.reduce(
    (sum, t) => sum + (n(t.total_sale) - n(t.expenses) - n(t.fuel_cost) - n(t.other_expenses)),
    0
  );
  const totalCommission = trips.reduce((sum, t) => sum + n(t.driverCommission), 0);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await axios.delete(`/api/trips/${id}`); // ✅ fixed
      setTrips(trips.filter(t => t._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Trips Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-4 rounded-2xl shadow bg-blue-500 text-white">
          <p className="text-lg">Total Sale</p>
          <h2 className="text-2xl font-bold">{money(totalSale)}</h2>
        </div>
        <div className="p-4 rounded-2xl shadow bg-yellow-500 text-white">
          <p className="text-lg">Total Expenses</p>
          <h2 className="text-2xl font-bold">{money(totalExpenses)}</h2>
        </div>
        <div className="p-4 rounded-2xl shadow bg-green-500 text-white">
          <p className="text-lg">Total Income</p>
          <h2 className="text-2xl font-bold">{money(totalIncome)}</h2>
        </div>
        <div className="p-4 rounded-2xl shadow bg-red-500 text-white">
          <p className="text-lg">Driver Commission (10%)</p>
          <h2 className="text-2xl font-bold">{money(totalCommission)}</h2>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white shadow p-6 rounded-2xl">
        {[{ label: "Date", name: "date", type: "date" },
        { label: "Total Bill", name: "total_bill", type: "number" },
        { label: "Amount", name: "amount", type: "number" },
        { label: "Expenses", name: "expenses", type: "number" },
        { label: "Fuel Cost", name: "fuel_cost", type: "number" },
        { label: "Other Expenses", name: "other_expenses", type: "number" },
        { label: "Mileage (KM)", name: "milage_km", type: "number" }].map(field => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-lg p-2 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount Type</label>
          <select name="amountType" value={form.amountType} onChange={handleChange} className="mt-1 block w-full border rounded-lg p-2 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500">
            <option value="received">Received</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Truck */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Truck</label>
          <select name="truck_id" value={form.truck_id} onChange={handleChange} className="mt-1 block w-full border rounded-lg p-2 bg-white text-black focus:ring-2 focus:ring-orange-500">
            <option value="">Select Truck</option>
            {trucks.map(t => <option key={t._id} value={t._id}>{t.model || "Unnamed Truck"}</option>)}
          </select>
        </div>

        {/* Driver */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Driver</label>
          <select name="driver_id" value={form.driver_id} onChange={handleChange} className="mt-1 block w-full border rounded-lg p-2 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500">
            <option value="">Select Driver</option>
            {drivers.map(d => <option key={d._id} value={d._id}>{d.full_name}</option>)}
          </select>
        </div>

        {/* Dealer */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Dealer</label>
          <select name="dealer_id" value={form.dealer_id} onChange={handleChange} className="mt-1 block w-full border rounded-lg p-2 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500">
            <option value="">Select Dealer</option>
            {dealers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>

        <div className="md:col-span-3">
          <button type="submit" disabled={saving} className="w-full py-2 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Saving..." : "Save Trip"}
          </button>
        </div>
      </form>

      {/* Trips Table */}
      <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
        {loading ? (
          <p>Loading trips...</p>
        ) : trips.length === 0 ? (
          <p className="text-gray-500">No trips yet.</p>
        ) : (
          <Table className="min-w-full border text-sm">
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Total Bill</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Expenses</TableHead>
                <TableHead>Fuel Cost</TableHead>
                <TableHead>Other Expenses</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead>Total Income</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Truck Model</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Dealer</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map(t => {
                const tripTruck = trucks.find(tr => tr._id === (t.truck?._id || t.truck));
                const tripDriver = drivers.find(dr => dr._id === (t.driver?._id || t.driver));
                const tripDealer = dealers.find(dl => dl._id === (t.dealer?._id || t.dealer));

                return (
                  <TableRow key={t._id} className="text-center">
                    <TableCell>{t.date ? new Date(t.date).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>{money(n(t.total_sale))}</TableCell>
                    <TableCell>{money(n(t.amount))}</TableCell>
                    <TableCell>{money(n(t.expenses))}</TableCell>
                    <TableCell>{money(n(t.fuel_cost))}</TableCell>
                    <TableCell>{money(n(t.other_expenses))}</TableCell>
                    <TableCell>{n(t.kilometres)} km</TableCell>
                    <TableCell>{money(n(t.total_income || 0))}</TableCell> {/* ✅ fixed */}
                    <TableCell>{money(n(t.driverCommission))}</TableCell>
                    <TableCell>{tripTruck?.model || "—"}</TableCell>
                    <TableCell>{tripDriver?.full_name || "—"}</TableCell>
                    <TableCell>{tripDealer?.name || "—"}</TableCell>
                    <TableCell className="flex flex-wrap gap-2 justify-center">
                      <button className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm" onClick={() => alert("Edit functionality to be implemented")}>
                        Edit
                      </button>
                      <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm" onClick={() => handleDelete(t._id)}>
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
