"use client";

import { useEffect, useState } from "react";

export default function TyresPage() {
  const [loading, setLoading] = useState(true);
  const [trucks, setTrucks] = useState([]);
  const [tyres, setTyres] = useState([]);
  const [showFormDrawer, setShowFormDrawer] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState({
    truckId: "",
    brand: "",
    serial: "",
    position: "",
    purchasePrice: "",
    installedDate: "",
    startingOdometer: "",
    currentOdometer: ""
  });

  // Load trucks and tyres
  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, yRes] = await Promise.all([
        fetch("/api/trucks"),
        fetch("/api/tyres")
      ]);
      const trucksJson = await tRes.json();
      const tyresJson = await yRes.json();

      setTrucks(trucksJson?.data || []);
      setTyres((tyresJson?.data || []).reverse());
    } catch (err) {
      console.error("Load error:", err);
      setTrucks([]);
      setTyres([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenForm = () => {
    setForm({
      truckId: "",
      brand: "",
      serial: "",
      position: "",
      purchasePrice: "",
      installedDate: "",
      startingOdometer: "",
      currentOdometer: ""
    });
    setShowFormDrawer(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.truckId || !form.serial) {
      alert("❌ Truck and Serial Number are required!");
      return;
    }
    try {
      const res = await fetch("/api/tyres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      await loadData();
      setShowFormDrawer(false);
    } catch (err) {
      console.error("Save error:", err);
      alert(`❌ Failed to save tyre record: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this tyre record?")) return;
    try {
      const res = await fetch(`/api/tyres/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await loadData();
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Failed to delete.");
    }
  };

  // Summary
  const tyresArr = Array.isArray(tyres) ? tyres : [];
  const summary = {
    totalTyres: tyresArr.length,
    needReplace: tyresArr.filter(t => t.status === "Needs Replacement" || (t.usagePct ?? 0) > 80).length,
    totalInvestment: tyresArr.reduce((s, t) => s + (Number(t.purchasePrice) || 0), 0),
    avgLife: tyresArr.length ? Math.round(tyresArr.reduce((s, t) => s + (Number(t.km) || 0), 0) / tyresArr.length) : 0
  };

  // Filtered tyres
  const filteredTyres = tyresArr
    .filter(t =>
      [t.brand, t.serial, t.truckId?.number, t.truckId?.model]
        .filter(Boolean)
        .some(val => val.toLowerCase().includes(search.toLowerCase()))
    )
    .filter(t => (filterStatus ? t.status === filterStatus : true));

  return (
    <div className="p-4 sm:p-6">
      {/* Header + Search + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Tyre Management</h1>
          <p className="text-sm text-slate-500">Track every tyre across your fleet</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            type="text"
            placeholder="Search Tyres / Trucks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-md px-3 py-2 w-full sm:w-56 text-sm"
          />
          <div className="w-full sm:w-60">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto border border-slate-300 rounded-md px-4 py-2 text-sm sm:text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              <option value="">All Status</option>
              <option value="OK">OK</option>
              <option value="Needs Replacement">Needs Replacement</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <button
            onClick={handleOpenForm}
            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow"
          >
            + Add Tyre
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white">
          <div className="text-sm font-medium">Total Tyres</div>
          <div className="text-2xl font-bold">{summary.totalTyres}</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white">
          <div className="text-sm font-medium">Need Replacement</div>
          <div className="text-2xl font-bold">{summary.needReplace}</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-600 text-white">
          <div className="text-sm font-medium">Total Investment</div>
          <div className="text-2xl font-bold">₨ {summary.totalInvestment.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-r from-orange-400 to-rose-400 text-white">
          <div className="text-sm font-medium">Avg Life Usage</div>
          <div className="text-2xl font-bold">{summary.avgLife} km</div>
        </div>
      </div>

      {/* Tyres Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 text-xs uppercase">
            <tr>
              <th className="p-3 text-left">Brand</th>
              <th className="p-3 text-left">Serial</th>
              <th className="p-3 text-left">Position</th>
              <th className="p-3 text-left">Truck</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-4 text-center text-slate-500">Loading...</td></tr>
            ) : filteredTyres.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center text-slate-500">No tyres found.</td></tr>
            ) : filteredTyres.map(t => (
              <tr
                key={t._id}
                className="border-b hover:bg-blue-50 cursor-pointer"
                onClick={() => setShowDetailDrawer(t)}
              >
                <td className="p-3">{t.brand || "-"}</td>
                <td className="p-3">{t.serial || "N/A"}</td>
                <td className="p-3">{t.position || "-"}</td>
                <td className="p-3">{t.truckId?.number || "N/A"}</td>
                <td className="p-3">₨ {t.purchasePrice || 0}</td>
                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.status === "Critical" || (t.usagePct ?? 0) >= 90
                      ? "bg-rose-100 text-rose-700"
                      : "bg-green-100 text-green-700"
                    }`}>
                    {t.status || ((t.usagePct ?? 0) >= 90 ? "Critical" : "OK")}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(t._id); }}
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Tyre Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ${showFormDrawer ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 flex flex-col h-full">
          <button onClick={() => setShowFormDrawer(false)} className="self-end text-xl mb-4">✖</button>
          <h3 className="text-lg font-semibold mb-4">Add Tyre</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 overflow-y-auto">
            <select name="truckId" value={form.truckId} onChange={handleChange} className="p-2 border rounded">
              <option value="">Select Truck</option>
              {trucks.map(truck => (
                <option key={truck._id} value={truck._id}>{truck.number} - {truck.model}</option>
              ))}
            </select>
            <input name="brand" value={form.brand} onChange={handleChange} placeholder="Brand" className="p-2 border rounded" />
            <input name="serial" value={form.serial} onChange={handleChange} placeholder="Serial Number" className="p-2 border rounded" />
            <input name="position" value={form.position} onChange={handleChange} placeholder="Position" className="p-2 border rounded" />
            <input name="installedDate" value={form.installedDate} onChange={handleChange} type="date" className="p-2 border rounded" />
            <input name="purchasePrice" value={form.purchasePrice} onChange={handleChange} placeholder="Price (₨)" className="p-2 border rounded" />
            <input name="startingOdometer" value={form.startingOdometer} onChange={handleChange} placeholder="Starting Odometer (km)" className="p-2 border rounded" />
            <input name="currentOdometer" value={form.currentOdometer} onChange={handleChange} placeholder="Current Odometer (km)" className="p-2 border rounded" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-2">Save</button>
          </form>
        </div>
      </div>

      {/* Detail Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ${showDetailDrawer ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 flex flex-col h-full">
          <button onClick={() => setShowDetailDrawer(null)} className="self-end text-xl mb-4">✖</button>
          <h3 className="text-lg font-semibold mb-4">Tyre Details</h3>
          {showDetailDrawer && (
            <div className="space-y-2 text-sm overflow-y-auto">
              <p><b>Brand:</b> {showDetailDrawer.brand}</p>
              <p><b>Serial:</b> {showDetailDrawer.serial}</p>
              <p><b>Truck:</b> {showDetailDrawer.truckId?.number || "N/A"}</p>
              <p><b>Price:</b> ₨ {showDetailDrawer.purchasePrice}</p>
              <p><b>Position:</b> {showDetailDrawer.position}</p>
              <p><b>Installed Date:</b> {showDetailDrawer.installedDate}</p>
              <p><b>Odometer Start:</b> {showDetailDrawer.startingOdometer}</p>
              <p><b>Odometer Current:</b> {showDetailDrawer.currentOdometer}</p>
              <div className="mt-2">
                <div className="text-xs text-slate-500">Usage %</div>
                <div className="w-full bg-slate-200 h-2 rounded">
                  <div className="bg-blue-600 h-2 rounded" style={{ width: `${showDetailDrawer.usagePct ?? 0}%` }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
