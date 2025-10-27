'use client';

import { useEffect, useState } from "react";
import axios from "axios";

export default function DealersPage() {
  const [dealers, setDealers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterName, setFilterName] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [sortBy, setSortBy] = useState("name"); // "name" | "amountLeft"
  const [sortOrder, setSortOrder] = useState("asc");

  // Modal states
  const [showDealerForm, setShowDealerForm] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);
  const [dealerForm, setDealerForm] = useState({ name: "", phone: "" });

  const [showLedger, setShowLedger] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [dealerPayments, setDealerPayments] = useState({}); // { dealerId: [{date, amount, note}] }

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
      setTrips(Array.isArray(tripRes.data) ? tripRes.data : []);
    } catch (err) {
      console.error("Error fetching dealers or trips:", err);
      setDealers([]);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }

  const calculateDealerTotals = (dealerId) => {
    const dealerTrips = trips.filter((t) => t.dealer?._id === dealerId);
    const totalBill = dealerTrips.reduce((sum, t) => sum + (t.total_bill || 0), 0);
    const payments = dealerPayments[dealerId] || [];
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const amountLeft = totalBill - totalPaid;
    return { totalBill, totalPaid, amountLeft };
  };

  // Filter + Sort
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

  // Dealer form
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
        setDealers((prev) => prev.map(d => d._id === editingDealer._id ? res.data : d));
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

  // Ledger
  const openLedger = (dealer) => {
    setSelectedDealer(dealer);
    setShowLedger(true);
  };

  // Add payment
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
          <p className="text-sm text-gray-500">
            Manage dealers, track payments, and view billing ledger.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => openDealerForm()}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm rounded-md transition-all"
          >
            + Add Dealer
          </button>
          <button
            onClick={() => { setFilterName(""); setFilterPhone(""); setFilterMonth(""); setFilterYear(""); }}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm rounded-md transition-all"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Dealer Name"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="border p-2 rounded-md text-sm"
        />
        <input
          type="text"
          placeholder="Phone"
          value={filterPhone}
          onChange={(e) => setFilterPhone(e.target.value)}
          className="border p-2 rounded-md text-sm"
        />
        <input
          type="number"
          placeholder="Month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="border p-2 rounded-md text-sm w-20"
        />
        <input
          type="number"
          placeholder="Year"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="border p-2 rounded-md text-sm w-24"
        />
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
                  <td className="p-2 border text-right">Rs {amountLeft} <span className={`ml-2 px-2 py-0.5 rounded text-xs ${status==="Paid"?"bg-green-200 text-green-800":status==="Partially Paid"?"bg-yellow-200 text-yellow-800":"bg-red-200 text-red-800"}`}>{status}</span></td>
                  <td className="p-2 border">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openDealerForm(dealer)} className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-all">Edit</button>
                      <button onClick={() => handleDeleteDealer(dealer._id)} className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-all">Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {dealers.length === 0 && <div className="p-6 text-center text-gray-500">No dealers found — add your first one above.</div>}

      {/* Dealer Form Modal */}
      {showDealerForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-80 sm:w-96 border">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">{editingDealer ? "Edit Dealer" : "Add New Dealer"}</h2>
            <form onSubmit={handleSaveDealer}>
              <input type="text" placeholder="Dealer Name" className="border p-2 w-full mb-2 rounded-md focus:ring-2 focus:ring-blue-600 outline-none text-sm" value={dealerForm.name} onChange={e => setDealerForm({...dealerForm, name: e.target.value})} required />
              <input type="text" placeholder="Phone" className="border p-2 w-full mb-4 rounded-md focus:ring-2 focus:ring-blue-600 outline-none text-sm" value={dealerForm.phone} onChange={e => setDealerForm({...dealerForm, phone: e.target.value})} />
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-gray-300 text-gray-800 text-sm rounded-md hover:bg-gray-400 transition-all" onClick={() => setShowDealerForm(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800 transition-all">{editingDealer ? "Update" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ledger Modal */}
      {showLedger && selectedDealer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 px-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-4 border overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{selectedDealer.name} — Billing Ledger</h2>
              <button onClick={() => setShowLedger(false)} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition-all">Close</button>
            </div>

            <div className="mb-4 flex justify-end gap-2">
              <button onClick={openPaymentModal} className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 transition-all text-sm">Add Payment</button>
            </div>

            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-100 sticky top-0 text-gray-700">
                <tr>
                  <th className="border p-2 text-left">Date</th>
                  <th className="border p-2 text-right">Bill</th>
                  <th className="border p-2 text-right">Amount Received</th>
                  <th className="border p-2 text-right">Amount Due</th>
                  <th className="border p-2 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {trips.filter(t => t.dealer?._id === selectedDealer._id).map((trip, idx) => {
                  const payments = dealerPayments[selectedDealer._id] || [];
                  const paidOnThisTrip = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
                  const amountDue = (trip.total_bill || 0) - paidOnThisTrip;
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border p-2">{trip.date || ""}</td>
                      <td className="border p-2 text-right">{trip.total_bill}</td>
                      <td className="border p-2 text-right">{paidOnThisTrip}</td>
                      <td className="border p-2 text-right">{amountDue}</td>
                      <td className="border p-2">{/* optional note */}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Payment History Modal */}
            {showPaymentModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 px-4">
                <div className="bg-white rounded-2xl shadow-lg w-80 sm:w-96 p-6 border">
                  <h3 className="text-lg font-semibold mb-4">Add Payment</h3>
                  <form onSubmit={handleSavePayment} className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Date</label>
                      <input type="date" value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} className="border p-2 rounded w-full" required/>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Amount Received</label>
                      <input type="number" min={0.01} value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="border p-2 rounded w-full" required/>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Note (Optional)</label>
                      <input type="text" value={paymentForm.note} onChange={e => setPaymentForm({...paymentForm, note: e.target.value})} className="border p-2 rounded w-full"/>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={()=>setShowPaymentModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
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
