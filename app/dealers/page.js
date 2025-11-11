'use client';

import { useEffect, useState } from "react";
import axios from "axios";

export default function DealersPage() {
  const [dealers, setDealers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & sorting
  const [filterName, setFilterName] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Dealer form
  const [showDealerForm, setShowDealerForm] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);
  const [dealerForm, setDealerForm] = useState({ name: "", phone: "" });

  // Ledger & payments
  const [showLedger, setShowLedger] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [dealerPayments, setDealerPayments] = useState({});

  const [paymentForm, setPaymentForm] = useState({ date: "", amount: "", note: "" });
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [dealerRes, tripRes] = await Promise.all([
        axios.get("/api/dealers"),
        axios.get("/api/trips"),
      ]);
      setDealers(Array.isArray(dealerRes.data) ? dealerRes.data : []);
      setTrips(Array.isArray(tripRes.data.data) ? tripRes.data.data : tripRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setDealers([]);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }

  const calculateDealerTotals = (dealerId) => {
    const dealerTrips = trips.filter(t => t.dealer?._id === dealerId);
    const totalBill = dealerTrips.reduce((sum, t) => sum + (t.total_sale || t.total_bill || 0), 0);
    const payments = dealerPayments[dealerId] || [];
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const amountLeft = totalBill - totalPaid;
    return { totalBill, totalPaid, amountLeft };
  };

  const filteredDealers = dealers
    .filter(d =>
      d.name.toLowerCase().includes(filterName.toLowerCase()) &&
      (!filterPhone || d.phone?.includes(filterPhone))
    )
    .sort((a, b) => {
      const { amountLeft: aLeft } = calculateDealerTotals(a._id);
      const { amountLeft: bLeft } = calculateDealerTotals(b._id);
      if (sortBy === "name") return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (sortBy === "amountLeft") return sortOrder === "asc" ? aLeft - bLeft : bLeft - aLeft;
      return 0;
    });

  const openDealerForm = (dealer = null) => {
    if (dealer) {
      setEditingDealer(dealer);
      setDealerForm({ name: dealer.name, phone: dealer.phone || "" });
    } else {
      setEditingDealer(null);
      setDealerForm({ name: "", phone: "" });
    }
    setShowDealerForm(true);
  };

  async function handleSaveDealer(e) {
    e.preventDefault();
    try {
      if (editingDealer) {
        const res = await axios.put(`/api/dealers/${editingDealer._id}`, dealerForm);
        setDealers(prev => prev.map(d => d._id === editingDealer._id ? res.data : d));
      } else {
        const res = await axios.post("/api/dealers", dealerForm);
        setDealers(prev => [...prev, res.data]);
      }
      setShowDealerForm(false);
      setEditingDealer(null);
      setDealerForm({ name: "", phone: "" });
    } catch (err) {
      console.error("Error saving dealer:", err);
    }
  }

  async function handleDeleteDealer(id) {
    if (!confirm("Are you sure you want to delete this dealer?")) return;
    try {
      await axios.delete(`/api/dealers/${id}`);
      setDealers(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      console.error("Error deleting dealer:", err);
    }
  }

  const openLedger = (dealer) => {
    setSelectedDealer(dealer);
    setShowLedger(true);
  };

  const openPaymentModal = () => {
    setPaymentForm({ date: new Date().toISOString().slice(0, 10), amount: "", note: "" });
    setShowPaymentModal(true);
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) return;
    setDealerPayments(prev => {
      const dealerId = selectedDealer._id;
      const prevPayments = prev[dealerId] || [];
      return {
        ...prev,
        [dealerId]: [...prevPayments, { ...paymentForm }]
      };
    });
    setShowPaymentModal(false);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-4 sm:p-6 mt-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dealers</h1>
          <p className="text-sm text-gray-500">Manage dealers, track payments, and view trips ledger.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => openDealerForm()} className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800">+ Add Dealer</button>
          <button onClick={() => { setFilterName(""); setFilterPhone(""); }} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">Reset Filters</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input type="text" placeholder="Dealer Name" value={filterName} onChange={e => setFilterName(e.target.value)} className="border p-2 rounded-md text-sm"/>
        <input type="text" placeholder="Phone" value={filterPhone} onChange={e => setFilterPhone(e.target.value)} className="border p-2 rounded-md text-sm"/>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border p-2 rounded-md text-sm">
          <option value="name">Dealer Name</option>
          <option value="amountLeft">Amount Left</option>
        </select>
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="border p-2 rounded-md text-sm">
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      {/* Dealers Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 border">Dealer Name</th>
              <th className="p-2 border">Total Bill</th>
              <th className="p-2 border">Paid</th>
              <th className="p-2 border">Amount Left</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDealers.map(dealer => {
              const { totalBill, totalPaid, amountLeft } = calculateDealerTotals(dealer._id);
              let status = "Pending";
              if (amountLeft === 0 && totalBill > 0) status = "Paid";
              else if (amountLeft > 0 && totalPaid > 0) status = "Partially Paid";

              return (
                <tr key={dealer._id} className="text-center hover:bg-gray-50">
                  <td className="p-2 border cursor-pointer text-left" onClick={() => openLedger(dealer)}>{dealer.name}</td>
                  <td className="p-2 border text-right">Rs {totalBill}</td>
                  <td className="p-2 border text-right">Rs {totalPaid}</td>
                  <td className="p-2 border text-right">
                    Rs {amountLeft} <span className={`ml-2 px-2 py-0.5 rounded text-xs ${status==="Paid"?"bg-green-200 text-green-800":status==="Partially Paid"?"bg-yellow-200 text-yellow-800":"bg-red-200 text-red-800"}`}>{status}</span>
                  </td>
                  <td className="p-2 border">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openDealerForm(dealer)} className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs">Edit</button>
                      <button onClick={() => handleDeleteDealer(dealer._id)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Dealer Form Modal */}
      {showDealerForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-80 sm:w-96 border">
            <h2 className="text-lg font-semibold mb-4">{editingDealer ? "Edit Dealer" : "Add New Dealer"}</h2>
            <form onSubmit={handleSaveDealer}>
              <input type="text" placeholder="Dealer Name" className="border p-2 w-full mb-2 rounded-md" value={dealerForm.name} onChange={e => setDealerForm({...dealerForm, name: e.target.value})} required />
              <input type="text" placeholder="Phone" className="border p-2 w-full mb-4 rounded-md" value={dealerForm.phone} onChange={e => setDealerForm({...dealerForm, phone: e.target.value})}/>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowDealerForm(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded-md">{editingDealer ? "Update" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

{/* Ledger Modal */}
{showLedger && selectedDealer && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 px-4">
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl p-6 border overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{selectedDealer.name} — Trip Ledger</h2>
        <button onClick={() => setShowLedger(false)} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition-all">Close</button>
      </div>

      {/* Summary Section: now in 3 columns above Add Payment */}
      {(() => {
        const dealerTrips = trips.filter(t => t.dealer?._id === selectedDealer._id);
        const totalBill = dealerTrips.reduce((sum, t) => sum + (t.total_sale || t.total_bill || 0), 0);
        const payments = dealerPayments[selectedDealer._id] || [];
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const totalDue = totalBill - totalPaid;

        return (
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm sm:text-base font-medium text-center">
            <p>Total Commission: <span className="font-semibold text-blue-700">Rs 0.00</span></p>
            <p>Total Paid: <span className="font-semibold text-green-700">Rs {totalPaid.toFixed(2)}</span></p>
            <p>Total Amount Due: <span className="font-semibold text-red-700">Rs {totalDue.toFixed(2)}</span></p>
          </div>
        );
      })()}

      {/* Add Payment Button */}
      <div className="mb-4 flex justify-end gap-2">
        <button onClick={openPaymentModal} className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 transition-all text-sm">Add Payment</button>
      </div>

      <table className="min-w-full text-sm border-collapse">
        <thead className="bg-blue-700 text-white sticky top-0">
          <tr>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Total Bill</th>
            <th className="p-2 border">Amount Received</th>
            <th className="p-2 border">Pending</th>
          </tr>
        </thead>
        <tbody>
          {/* Trip Rows */}
          {trips.filter(t => t.dealer?._id === selectedDealer._id).map((trip, idx) => {
            const pending = (trip.total_sale || trip.total_bill || 0) - (trip.amount_received || 0);
            return (
              <tr key={idx} className="hover:bg-gray-50 text-center transition-all">
                <td className="p-2 border">{trip.date ? new Date(trip.date).toLocaleDateString() : "-"}</td>
                <td className="p-2 border text-right">Rs {(trip.total_sale || trip.total_bill || 0).toFixed(2)}</td>
                <td className="p-2 border text-right">Rs {(trip.amount_received || 0).toFixed(2)}</td>
                <td className={`p-2 border text-right font-semibold ${pending > 0 ? "text-red-600" : "text-green-700"}`}>Rs {pending.toFixed(2)}</td>
              </tr>
            );
          })}

          {/* Payment Rows */}
          {(dealerPayments[selectedDealer._id] || []).map((p, i) => (
            <tr key={`p-${i}`} className="bg-green-50 text-center">
              <td className="p-2 border">{new Date(p.date).toLocaleDateString()}</td>
              <td className="p-2 border text-right">—</td>
              <td className="p-2 border text-right">Rs {Number(p.amount).toFixed(2)}</td>
              <td className="p-2 border text-right">—</td>
            </tr>
          ))}
        </tbody>
      </table>

      {trips.filter(t => t.dealer?._id === selectedDealer._id).length === 0 &&
        (dealerPayments[selectedDealer._id] || []).length === 0 && (
        <p className="text-center text-gray-500 mt-4">No trips or payments found for this dealer yet.</p>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 px-4">
          <div className="bg-white rounded-2xl shadow-lg w-80 sm:w-96 p-6 border">
            <h3 className="text-lg font-semibold mb-4">Add Payment</h3>
            <form onSubmit={handleSavePayment} className="space-y-3">
              <div>
                <label className="text-sm font-medium">Date</label>
                <input
                  type="date"
                  value={paymentForm.date}
                  onChange={e => setPaymentForm({...paymentForm, date:e.target.value})}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount Received</label>
                <input
                  type="number"
                  min={0.01}
                  step="0.01"      // ✅ now accepts 111.01, 110.99 etc.
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({...paymentForm, amount:e.target.value})}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Note (Optional)</label>
                <input
                  type="text"
                  value={paymentForm.note}
                  onChange={e => setPaymentForm({...paymentForm, note:e.target.value})}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
)}


    </div>
  );
}
