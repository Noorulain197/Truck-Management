"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("../components/SmallChart"), { ssr: false });

export default function Home() {
  const [stats, setStats] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        if (data.mileage >= 4000) setShowPopup(true);
      });
  }, []);

  const handleClearMileage = async () => {
    await fetch("/api/clearMileage", { method: "POST" });
    setShowPopup(false);
    setStats((prev) => ({ ...prev, mileage: 0 }));
  };

  if (!stats) return <p className="text-center mt-10 text-gray-400">Loading...</p>;

 return (
  <section className="p-4 sm:p-6 md:p-8 bg-gray-900 text-white rounded-2xl shadow-2xl mb-8 overflow-hidden">
    {/* Header */}
    <div className="max-w-3xl mx-auto text-center space-y-4 px-2 sm:px-0">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight transition-all duration-300">
        Smart Fleet & Truck Management
      </h1>
      <h6 className="text-blue-500 font-semibold text-sm sm:text-base uppercase tracking-wide">
        Designed for Modern Logistics
      </h6>
      <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
        Manage your <b>drivers</b>, <b>trucks</b>, and <b>daily operations</b> all in one place. Real-time insights, expense tracking, and maintenance reminders — all in a sleek, mobile-friendly dashboard.
      </p>
      <p className="text-gray-400 text-xs sm:text-sm">
        Built for companies who want <b>speed, accuracy,</b> and <b>control</b> over their transport operations.
      </p>
      <a
        href="/trips"
        className="inline-block mt-4 sm:mt-6 px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 hover:bg-blue-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        Get Started →
      </a>
    </div>

    {/* Stats Cards */}
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2 sm:px-0">
      <div className="bg-blue-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-blue-700 hover:scale-105 transition-all text-center">
        <div className="text-xs opacity-80">Income</div>
        <div className="text-2xl sm:text-3xl font-bold mt-2">PKR {stats.income}</div>
      </div>
      <div className="bg-red-700 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-red-600 hover:scale-105 transition-all text-center">
        <div className="text-xs opacity-80">Expenses</div>
        <div className="text-2xl sm:text-3xl font-bold mt-2">PKR {stats.expense}</div>
      </div>
      <div className="bg-blue-800 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-blue-700 hover:scale-105 transition-all text-center">
        <div className="text-xs opacity-80">Net Profit</div>
        <div className="text-2xl sm:text-3xl font-bold mt-2">PKR {stats.income - stats.expense}</div>
      </div>
      <div className="bg-yellow-500 text-black p-4 sm:p-5 rounded-2xl shadow-md border border-yellow-400 hover:scale-105 transition-all text-center">
        <div className="text-xs opacity-80">Pending</div>
        <div className="text-2xl sm:text-3xl font-bold mt-2">PKR {stats.pending}</div>
      </div>
    </div>

    {/* Truck Mileage */}
    <div className="mt-6 bg-gray-800 p-4 sm:p-5 rounded-2xl shadow hover:shadow-blue-500/40 transition-all">
      <h3 className="font-semibold mb-2 text-lg">Truck Mileage</h3>
      <p>
        This Month: <span className="font-bold text-blue-400">{stats.mileage} km</span>
      </p>
    </div>

    {/* Chart */}
    <div className="mt-6 bg-gray-800 p-4 sm:p-5 rounded-2xl shadow hover:shadow-blue-500/40 transition-all">
      <h3 className="font-semibold mb-4 text-lg">📈 Activity Overview</h3>
      <Chart data={stats.activity} />
    </div>

    {/* Popup */}
    {showPopup && (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
        <div className="bg-blue-900 p-6 rounded-2xl shadow-lg max-w-md w-full text-center border-t-4 border-blue-700 relative">
          <button
            onClick={() => setShowPopup(false)}
            className="absolute top-3 right-3 text-gray-300 hover:text-white text-lg font-bold"
            aria-label="Close"
          >
            &times;
          </button>

          <h3 className="text-xl font-bold text-white mb-2">⚠ Oil Change Reminder</h3>
          <p className="mb-6 text-gray-200">
            Truck mileage has reached <b>{stats.mileage} km</b>.<br />
            Please schedule an oil change soon.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleClearMileage}
              className="px-5 py-2 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-600 hover:scale-105 transition-all"
            >
              Clear Mileage
            </button>
            <button
              onClick={() => setShowPopup(false)}
              className="px-5 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-600 hover:scale-105 transition-all"
            >
              Save Mileage
            </button>
          </div>
        </div>
      </div>
    )}
  </section>
);


}
