'use client';
import { useEffect, useState } from "react";
import axios from "axios";

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const [payments, setPayments] = useState({}); // manual payments

  // form modal state
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null); // track edit mode
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    license_no: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [driversRes, tripsRes] = await Promise.all([
        axios.get("/api/drivers"),
        axios.get("/api/trips"),
      ]);
      setDrivers(driversRes.data);
      setTrips(tripsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  const calculateCommission = (driverId) => {
    return trips
      .filter((t) => t.driver?._id === driverId)
      .reduce((sum, t) => sum + (t.driverCommission || 0), 0);
  };

  const handlePaymentChange = (driverId, value) => {
    setPayments((prev) => ({
      ...prev,
      [driverId]: Number(value) || 0,
    }));
  };

  // open modal for add / edit
  const openForm = (driver = null) => {
    if (driver) {
      setEditingDriver(driver);
      setForm({
        full_name: driver.full_name,
        phone: driver.phone,
        license_no: driver.license_no,
      });
    } else {
      setEditingDriver(null);
      setForm({ full_name: "", phone: "", license_no: "" });
    }
    setShowForm(true);
  };

  // save / update driver
  async function handleSaveDriver(e) {
    e.preventDefault();
    try {
      if (editingDriver) {
        const res = await axios.put(`/api/drivers/${editingDriver._id}`, form);
        setDrivers((prev) =>
          prev.map((d) => (d._id === editingDriver._id ? res.data : d))
        );
      } else {
        const res = await axios.post("/api/drivers", form);
        setDrivers((prev) => [...prev, res.data]);
      }
      setForm({ full_name: "", phone: "", license_no: "" });
      setEditingDriver(null);
      setShowForm(false);
    } catch (err) {
      console.error("Error saving driver:", err);
    }
  }

  // delete driver
  async function handleDeleteDriver(id) {
    if (!confirm("Are you sure you want to delete this driver?")) return;
    try {
      await axios.delete(`/api/drivers/${id}`);
      setDrivers((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Error deleting driver:", err);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Drivers</h1>

      <button
        onClick={() => openForm()}
        className="mb-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
      >
        + Add Driver
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="border px-4 py-2">Driver Name</th>
              <th className="border px-4 py-2">Total Commission</th>
              <th className="border px-4 py-2">Amount Paid</th>
              <th className="border px-4 py-2">Pending Amount</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => {
              const totalCommission = calculateCommission(d._id);
              const amountPaid = payments[d._id] || 0;
              const pending = totalCommission - amountPaid;

              return (
                <tr key={d._id} className="text-center">
                  <td className="border px-4 py-2">{d.full_name}</td>
                  <td className="border px-4 py-2">Rs {totalCommission}</td>
                  <td className="border px-4 py-2">
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) =>
                        handlePaymentChange(d._id, e.target.value)
                      }
                      className="w-24 border rounded p-1 text-center"
                      placeholder="Enter"
                    />
                  </td>
                  <td className="border px-4 py-2">Rs {pending}</td>
                  <td className="border px-4 py-2 flex gap-2 justify-center">
                    <button
                      onClick={() => openForm(d)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDriver(d._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-orange-600">
              {editingDriver ? "Edit Driver" : "Add New Driver"}
            </h2>
            <form onSubmit={handleSaveDriver} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-lg"
                  placeholder="e.g., Ali Khan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg"
                  placeholder="e.g., 0300-1234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">License No.</label>
                <input
                  type="text"
                  value={form.license_no}
                  onChange={(e) =>
                    setForm({ ...form, license_no: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-lg"
                  placeholder="e.g., LHR-12345"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                >
                  {editingDriver ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
