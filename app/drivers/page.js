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

      setDrivers(driversRes.data.data || []);
      setTrips(tripsRes.data.data || []);

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
    <div className="p-4 sm:p-6 mt-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Drivers
          </h1>
          <p className="text-sm text-gray-500">
            Manage driver records, commissions, and pending payments easily.
          </p>
        </div>

        <button
          onClick={() => openForm()}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm rounded-md transition-all"
        >
          + Add Driver
        </button>
      </div>

      {/* Table / Loader */}
      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border p-2 text-left">Driver Name</th>
                <th className="border p-2 text-center">Total Commission</th>
                <th className="border p-2 text-center">Amount Paid</th>
                <th className="border p-2 text-center">Pending</th>
                <th className="border p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => {
                const totalCommission = calculateCommission(d._id);
                const amountPaid = payments[d._id] || 0;
                const pending = totalCommission - amountPaid;

                return (
                  <tr
                    key={d._id}
                    className="text-center hover:bg-gray-50 transition-all"
                  >
                    <td className="border p-2 text-left font-medium text-gray-800">
                      {d.full_name}
                    </td>
                    <td className="border p-2 text-gray-700">
                      Rs {totalCommission}
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        value={amountPaid}
                        onChange={(e) =>
                          handlePaymentChange(d._id, e.target.value)
                        }
                        className="w-20 sm:w-24 border rounded p-1 text-center focus:ring-2 focus:ring-blue-600"
                        placeholder="Enter"
                      />
                    </td>
                    <td className="border p-2 text-gray-700">Rs {pending}</td>
                    <td className="border p-2 flex justify-center gap-2">
                      <button
                        onClick={() => openForm(d)}
                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs sm:text-sm transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDriver(d._id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs sm:text-sm transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* No Data */}
      {!loading && drivers.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          No driver records found
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingDriver ? "Edit Driver" : "Add New Driver"}
            </h2>

            <form onSubmit={handleSaveDriver} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700"
                  placeholder="e.g., Ali Khan"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700"
                  placeholder="e.g., 0300-1234567"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  License No.
                </label>
                <input
                  type="text"
                  value={form.license_no}
                  onChange={(e) =>
                    setForm({ ...form, license_no: e.target.value })
                  }
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700"
                  placeholder="e.g., LHR-12345"
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
