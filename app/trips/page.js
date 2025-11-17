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
  const [showForm, setShowForm] = useState(false);

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
    pickup_city: "",
    dropoff_city: "",
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

  useEffect(() => {
    fetchTrips();
    fetchDropdowns();
  }, []);

  // ------------------- FETCH TRIPS -------------------
  const fetchTrips = async () => {
    try {
      const res = await axios.get("/api/trips");
      const data = Array.isArray(res.data.data) ? res.data.data : [];

      const tripsWithCalc = data.map((t) => {
        const pending = (t.total_sale || 0) - (t.amount_received || 0);
        const commission = (t.total_sale || 0) * 0.1;
        const totalIncome =
          (t.amount_received || 0) -
          (t.expenses || 0) -
          (t.fuel_cost || 0) -
          (t.other_expenses || 0) -
          commission;

        return {
          ...t,
          amount_pending: pending,
          driverCommission: commission,
          total_income: totalIncome,
        };
      });

      setTrips(tripsWithCalc);

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

  // ------------------- FETCH DROPDOWNS -------------------
  const fetchDropdowns = async () => {
    try {
      const [driversRes, trucksRes, dealersRes] = await Promise.all([
        axios.get("/api/drivers"),
        axios.get("/api/trucks"),
        axios.get("/api/dealers"),
      ]);

      const driversData =
        driversRes.data.success && Array.isArray(driversRes.data.data)
          ? driversRes.data.data
          : [];

      const trucksData = Array.isArray(trucksRes.data.data)
        ? trucksRes.data.data
        : Array.isArray(trucksRes.data)
        ? trucksRes.data
        : [];

      const dealersData = Array.isArray(dealersRes.data.data)
        ? dealersRes.data.data
        : Array.isArray(dealersRes.data)
        ? dealersRes.data
        : [];

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

  // ------------------- FORM CHANGE -------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------- SUBMIT -------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const pending = (form.total_sale || 0) - (form.amount_received || 0);
    const commission = (form.total_sale || 0) * 0.1;
    const totalIncome =
      (form.amount_received || 0) -
      (form.expenses || 0) -
      (form.fuel_cost || 0) -
      (form.other_expenses || 0) -
      commission;

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

      resetForm();
      setShowForm(false);
      fetchTrips();
    } catch (err) {
      console.error("Error saving trip:", err);
      alert("Error saving trip. Try again.");
    }
  };

  const resetForm = () => {
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
      pickup_city: "",
      dropoff_city: "",
    });
  };

  // ------------------- DELETE -------------------
  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;

    try {
      await axios.delete(`/api/trips/${id}`);
      fetchTrips();
    } catch (err) {
      alert("Error deleting");
    }
  };

  // ------------------- EDIT -------------------
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
      pickup_city: trip.pickup_city || trip.pickupCity || "",
      dropoff_city: trip.dropoff_city || trip.dropoffCity || "",
    });

    setEditingId(trip._id);
    setShowForm(true);
  };

  return (
    <div className="p-4 sm:p-6 mt-10">
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-6 py-3 font-medium ${
            activeTab === "trips"
              ? "border-b-2 border-blue-700 text-blue-700"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("trips")}
        >
          Trips
        </button>

        <button
          className={`px-6 py-3 font-medium ${
            activeTab === "dashboard"
              ? "border-b-2 border-blue-700 text-blue-700"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("dashboard")}
        >
          Finance Dashboard
        </button>
      </div>

      {activeTab === "trips" && (
        <>
          {/* Summary Cards */}
          <div className="sticky top-0 bg-white p-4 shadow z-20">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {Object.entries(summary).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-blue-700 text-white rounded p-3 text-center"
                >
                  <div className="text-xs font-semibold">
                    {key.replace(/([A-Z])/g, " $1")}
                  </div>
                  <div className="text-lg font-bold">
                    {value?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ADD TRIP BUTTON RIGHT SIDE */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                resetForm();
                setEditingId(null);
                setShowForm(!showForm);
              }}
              className="px-6 py-2 bg-blue-700 text-white font-bold rounded"
            >
              Add Trip
            </button>
          </div>

          {/* FORM */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mt-4 bg-white p-6 rounded shadow max-w-4xl mx-auto"
            >
              <h2 className="text-xl font-semibold text-center mb-4">
                {editingId ? "Edit Trip" : "Add New Trip"}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <input
                  type="date"
                  name="date"
                  required
                  value={form.date}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  name="total_sale"
                  placeholder="Total Bill"
                  required
                  value={form.total_sale}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  name="amount_received"
                  placeholder="Amount Received"
                  required
                  value={form.amount_received}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />

                <input
                  type="number"
                  name="expenses"
                  placeholder="Expenses"
                  value={form.expenses}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  name="fuel_cost"
                  placeholder="Fuel Cost"
                  value={form.fuel_cost}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  name="other_expenses"
                  placeholder="Other Expenses"
                  value={form.other_expenses}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  name="kilometres"
                  placeholder="Mileage"
                  value={form.kilometres}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />

                {/* Pickup & Dropoff */}
                <input
                  type="text"
                  name="pickup_city"
                  placeholder="Pick-up City"
                  value={form.pickup_city}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="dropoff_city"
                  placeholder="Drop-off City"
                  value={form.dropoff_city}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />

                {/* Driver */}
                <select
                  name="driver"
                  value={form.driver}
                  required
                  onChange={handleChange}
                  className="p-2 border rounded"
                >
                  <option value="">Select Driver</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.full_name} - {d.license_no}
                    </option>
                  ))}
                </select>

                {/* Truck */}
                <select
                  name="truck"
                  value={form.truck}
                  required
                  onChange={handleChange}
                  className="p-2 border rounded"
                >
                  <option value="">Select Truck</option>
                  {trucks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.number}
                    </option>
                  ))}
                </select>

                {/* Dealer */}
                <select
                  name="dealer"
                  value={form.dealer}
                  required
                  onChange={handleChange}
                  className="p-2 border rounded"
                >
                  <option value="">Select Dealer</option>
                  {dealers.map((dl) => (
                    <option key={dl._id} value={dl._id}>
                      {dl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center mt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-700 text-white rounded"
                >
                  {editingId ? "Update Trip" : "Save Trip"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      resetForm();
                      setShowForm(false);
                    }}
                    className="ml-3 px-6 py-2 bg-gray-500 text-white rounded"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          {/* TABLE */}
          <div className="mt-6 overflow-x-auto bg-white rounded shadow border">
            <table className="min-w-full text-sm">
              <thead className="bg-blue-700 text-white sticky top-0">
                <tr className="text-center">
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Driver</th>
                  <th className="p-2 border">Truck No.</th>
                  <th className="p-2 border">Dealer</th>
                  <th className="p-2 border">Pick-up</th>
                  <th className="p-2 border">Drop-off</th>
                  <th className="p-2 border">Total Bill</th>
                  <th className="p-2 border">Received</th>
                  <th className="p-2 border">Pending</th>
                  <th className="p-2 border">Commission</th>
                  <th className="p-2 border">Expenses</th>
                  <th className="p-2 border">Fuel</th>
                  <th className="p-2 border">Other</th>
                  <th className="p-2 border">Km</th>
                  <th className="p-2 border">Income</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>

              <tbody>
                {trips.map((trip) => (
                  <tr key={trip._id} className="text-center hover:bg-gray-50">
                    <td className="p-2 border">
                      {trip.date
                        ? new Date(trip.date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-2 border">
                      {trip.driver?.full_name || "-"}
                    </td>
                    <td className="p-2 border">{trip.truck?.number || "-"}</td>
                    <td className="p-2 border">{trip.dealer?.name || "-"}</td>

                    {/* Pickup & Dropoff */}
                    <td className="p-2 border">
                      {trip.pickup_city || trip.pickupCity || "-"}
                    </td>
                    <td className="p-2 border">
                      {trip.dropoff_city || trip.dropoffCity || "-"}
                    </td>

                    <td className="p-2 border">
                      {trip.total_sale?.toLocaleString()}
                    </td>
                    <td className="p-2 border">
                      {trip.amount_received?.toLocaleString()}
                    </td>
                    <td className="p-2 border">
                      {trip.amount_pending?.toLocaleString()}
                    </td>
                    <td className="p-2 border">
                      {trip.driverCommission?.toLocaleString()}
                    </td>
                    <td className="p-2 border">
                      {trip.expenses?.toLocaleString()}
                    </td>
                    <td className="p-2 border">
                      {trip.fuel_cost?.toLocaleString()}
                    </td>
                    <td className="p-2 border">
                      {trip.other_expenses?.toLocaleString()}
                    </td>
                    <td className="p-2 border">
                      {trip.kilometres?.toLocaleString()}
                    </td>
                    <td className="p-2 border">
                      {trip.total_income?.toLocaleString()}
                    </td>

                    <td className="p-2 border flex gap-1 justify-center">
                      <button
                        className="px-2 py-1 bg-yellow-500 rounded text-white"
                        onClick={() => handleEdit(trip)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 bg-red-600 rounded text-white"
                        onClick={() => handleDelete(trip._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === "dashboard" && (
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
