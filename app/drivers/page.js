'use client';
import { useEffect, useState } from "react";
import axios from "axios";

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payments state: { driverId: [{date, amount, note}] }
  const [payments, setPayments] = useState({});

  // Form modal state (Add/Edit Driver)
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    license_no: "",
  });

  // Ledger modal state
  const [showLedger, setShowLedger] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Add Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    amount: "",
    note: "",
  });

  // Filters & Sorting
  const [filterName, setFilterName] = useState("");
  const [filterId, setFilterId] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" | "desc"

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

  // ----- COMMISSION LOGIC -----
  const calculateCommission = (driverId) => {
    return trips
      .filter((t) => t.driver?._id === driverId)
      .reduce((sum, t) => sum + (t.driverCommission || t.income * 0.1 || 0), 0);
  };

  const totalPaidForDriver = (driverId) => {
    const driverPayments = payments[driverId] || [];
    return driverPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  };

  const pendingForDriver = (driverId) => {
    return calculateCommission(driverId) - totalPaidForDriver(driverId);
  };

  // ----- FILTERED + SORTED DRIVERS -----
 const filteredDrivers = drivers
  .filter(d =>
    (d.full_name || "").toLowerCase().includes(filterName.toLowerCase()) &&
    (!filterId || (d._id || "").includes(filterId)) &&
    (!filterPhone || (d.phone || "").includes(filterPhone)) &&
    (!filterMonth || (d.createdAt && (new Date(d.createdAt).getMonth() + 1) === Number(filterMonth)))
  )

   .sort((a, b) =>
  sortOrder === "asc"
    ? (a.full_name || "").localeCompare(b.full_name || "")
    : (b.full_name || "").localeCompare(a.full_name || "")
)
.slice(0, 10); // latest 10 filtered

  // ----- DRIVER MODALS -----
  const openForm = (driver = null) => {
    if(driver){
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

  const openLedger = (driver) => {
    setSelectedDriver(driver);
    setShowLedger(true);
  };

  const openPaymentModal = () => {
    setPaymentForm({ date: new Date().toISOString().slice(0,10), amount: "", note: "" });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const amountNum = Number(paymentForm.amount);
    if(amountNum <= 0){
      alert("Amount must be greater than 0");
      return;
    }
    const pending = pendingForDriver(selectedDriver._id);
    if(amountNum > pending){
      alert("Cannot pay more than outstanding amount");
      return;
    }
    setPayments(prev => ({
      ...prev,
      [selectedDriver._id]: [
        ...(prev[selectedDriver._id] || []),
        { ...paymentForm, amount: amountNum }
      ]
    }));
    setShowPaymentModal(false);
  };

  // ----- DRIVER SAVE / DELETE -----
  async function handleSaveDriver(e){
    e.preventDefault();
    try {
      if(editingDriver){
        const res = await axios.put(`/api/drivers/${editingDriver._id}`, form);
        setDrivers(prev => prev.map(d => d._id === editingDriver._id ? res.data : d));
      } else {
        const res = await axios.post("/api/drivers", form);
        setDrivers(prev => [...prev, res.data]);
      }
      setForm({ full_name: "", phone: "", license_no: "" });
      setEditingDriver(null);
      setShowForm(false);
    } catch(err){
      console.error("Error saving driver:", err);
    }
  }

  async function handleDeleteDriver(id){
    if(!confirm("Are you sure you want to delete this driver?")) return;
    try {
      await axios.delete(`/api/drivers/${id}`);
      setDrivers(prev => prev.filter(d => d._id !== id));
    } catch(err){
      console.error("Error deleting driver:", err);
    }
  }

  return (
    <div className="p-4 sm:p-6 mt-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Drivers</h1>
          <p className="text-sm text-gray-500">Manage driver records, commissions, and pending payments easily.</p>
        </div>
        <button onClick={()=>openForm()} className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm rounded-md transition-all">+ Add Driver</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input type="text" placeholder="Driver Name" value={filterName} onChange={e=>setFilterName(e.target.value)} className="border rounded p-2"/>
        <input type="text" placeholder="Driver ID" value={filterId} onChange={e=>setFilterId(e.target.value)} className="border rounded p-2"/>
        <input type="text" placeholder="Phone" value={filterPhone} onChange={e=>setFilterPhone(e.target.value)} className="border rounded p-2"/>
        <input type="number" placeholder="Month (1-12)" value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} className="border rounded p-2 w-20"/>
        <input type="number" placeholder="Year" value={filterYear} onChange={e=>setFilterYear(e.target.value)} className="border rounded p-2 w-24"/>
        <select value={sortOrder} onChange={e=>setSortOrder(e.target.value)} className="border rounded p-2">
          <option value="asc">A → Z</option>
          <option value="desc">Z → A</option>
        </select>
      </div>

      {/* Table / Loader */}
      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700 sticky top-0">
              <tr>
                <th className="border p-2 text-left">Driver Name</th>
                <th className="border p-2 text-center">Total Commission</th>
                <th className="border p-2 text-center">Amount Paid</th>
                <th className="border p-2 text-center">Pending</th>
                <th className="border p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map(d=>{
                const totalCommission = calculateCommission(d._id);
                const amountPaid = totalPaidForDriver(d._id);
                const pending = totalCommission - amountPaid;

                return (
                  <tr key={d._id} className="text-center hover:bg-gray-50 transition-all">
                    <td className="border p-2 text-left font-medium text-gray-800">
                      <button onClick={()=>openLedger(d)} className="hover:underline">{d.full_name}</button>
                    </td>
                    <td className="border p-2 text-gray-700">Rs {totalCommission}</td>
                    <td className="border p-2 text-gray-700">Rs {amountPaid}</td>
                    <td className="border p-2 text-gray-700">Rs {pending}</td>
                    <td className="border p-2 flex justify-center gap-2">
                      <button onClick={()=>openForm(d)} className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs sm:text-sm transition-all">Edit</button>
                      <button onClick={()=>handleDeleteDriver(d._id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs sm:text-sm transition-all">Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* No Data */}
      {!loading && drivers.length===0 && (
        <div className="p-6 text-center text-gray-500">No driver records found</div>
      )}

      {/* ----- Add/Edit Driver Modal ----- */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingDriver ? "Edit Driver" : "Add New Driver"}</h2>
            <form onSubmit={handleSaveDriver} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Full Name</label>
                <input type="text" required value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700" placeholder="e.g., Ali Khan"/>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Phone</label>
                <input type="text" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700" placeholder="e.g., 0300-1234567"/>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">License No.</label>
                <input type="text" value={form.license_no} onChange={e=>setForm({...form, license_no:e.target.value})} className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700" placeholder="e.g., LHR-12345"/>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 border rounded-md hover:bg-gray-100 transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md transition-all">{editingDriver ? "Update" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----- Driver Ledger Modal ----- */}
      {showLedger && selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 border relative">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ledger: {selectedDriver.full_name}</h2>
            <div className="flex justify-between mb-2">
              <div>
                <button onClick={openPaymentModal} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">Add Payment</button>
              </div>
              <div className="text-right space-y-1">
                <div>Total Commission: Rs {calculateCommission(selectedDriver._id)}</div>
                <div>Total Paid: Rs {totalPaidForDriver(selectedDriver._id)}</div>
                <div>Outstanding: Rs {pendingForDriver(selectedDriver._id)}</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-gray-100 text-gray-700 sticky top-0">
                  <tr>
                    <th className="border p-2 text-left">Date</th>
                    <th className="border p-2 text-right">Commission</th>
                    <th className="border p-2 text-right">Amount Paid</th>
                    <th className="border p-2 text-right">Amount Due</th>
                    <th className="border p-2 text-left">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.filter(t=>t.driver?._id===selectedDriver._id).map((t,i)=>{
                    const commission = t.driverCommission || t.income*0.1 || 0;
                    const driverPayments = payments[selectedDriver._id] || [];
                    const paymentEntry = driverPayments[i] || {};
                    const paid = paymentEntry.amount || 0;
                    return (
                      <tr key={i} className="hover:bg-gray-50 transition-all">
                        <td className="border p-2 text-left">{t.date || t.createdAt?.slice(0,10)}</td>
                        <td className="border p-2 text-right">Rs {commission}</td>
                        <td className="border p-2 text-right">Rs {paid}</td>
                        <td className="border p-2 text-right">Rs {commission - paid}</td>
                        <td className="border p-2 text-left">{paymentEntry.note || ""}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <button onClick={()=>setShowLedger(false)} className="absolute top-3 right-3 px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded">X</button>
          </div>
        </div>
      )}

      {/* ----- Add Payment Modal ----- */}
      {showPaymentModal && selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border relative">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Payment: {selectedDriver.full_name}</h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Date</label>
                <input type="date" value={paymentForm.date} onChange={e=>setPaymentForm({...paymentForm, date:e.target.value})} className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700"/>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Amount Paid</label>
                <input type="number" value={paymentForm.amount} onChange={e=>setPaymentForm({...paymentForm, amount:e.target.value})} className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700"/>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Note (Optional)</label>
                <input type="text" value={paymentForm.note} onChange={e=>setPaymentForm({...paymentForm, note:e.target.value})} className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-700"/>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setShowPaymentModal(false)} className="px-4 py-2 border rounded-md hover:bg-gray-100 transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md transition-all">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
