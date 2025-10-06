"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Image from "next/image";

const Chart = dynamic(() => import("../components/SmallChart"), { ssr: false });

export default function Home() {
  const [stats, setStats] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);

        // 👀 Check if mileage >= 4000
        if (data.mileage >= 4000) {
          setShowPopup(true);
        }
      });
  }, []);

  const handleClearMileage = async () => {
    await fetch("/api/clearMileage", { method: "POST" }); // backend resets mileage to 0
    setShowPopup(false);
    setStats((prev) => ({ ...prev, mileage: 0 }));
  };

  if (!stats) return <p>Loading...</p>;

  return (
  <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-16 px-8 md:px-16 rounded-2xl shadow-2xl mb-12 overflow-hidden text-center">
    {/* 🚛 Centered Content */}
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-4xl md:text-5xl font-extrabold leading-tight hover:tracking-wide transition-all duration-300">
        Smart Fleet & Truck Management
      </h1>

      <h6 className="text-[var(--orange)] font-semibold text-lg uppercase tracking-wider">
        Designed for Modern Logistics
      </h6>

      <p className="text-gray-300 leading-relaxed text-base md:text-lg">
        Manage your <b>drivers</b>, <b>trucks</b>, and <b>daily operations</b> all in one place.
        Real-time insights, expense tracking, and maintenance reminders — all in a
        sleek, mobile-friendly dashboard.
      </p>

      <p className="text-gray-400 text-sm md:text-base">
        Built for companies who want <b>speed, accuracy,</b> and <b>control</b> over their transport operations.
      </p>

      {/* 🚀 Modernized Button */}
      <a
        href="/trips"
        className="inline-block mt-6 px-10 py-4 bg-[var(--orange)] text-white font-bold text-lg rounded-xl shadow-[0_4px_20px_rgba(255,140,0,0.4)] 
        hover:bg-orange-600 hover:shadow-[0_6px_25px_rgba(255,140,0,0.6)] hover:scale-110 
        active:scale-95 transition-all duration-300"
      >
        Get Started →
      </a>
    </div>

    {/* ✨ Stats Section */}
    <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-green-600 text-white p-5 rounded-2xl shadow-lg border border-green-500 hover:scale-105 hover:border-white transition">
        <div className="text-sm opacity-80 text-center">Income</div>
        <div className="text-3xl text-center font-bold">PKR {stats.income}</div>
      </div>

      <div className="bg-red-600 text-white p-5 rounded-2xl shadow-lg border border-red-500 hover:scale-105 hover:border-white transition">
        <div className="text-sm opacity-80 text-center">Expenses</div>
        <div className="text-3xl text-center font-bold">PKR {stats.expense}</div>
      </div>

      <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-lg border border-blue-500 hover:scale-105 hover:border-white transition">
        <div className="text-sm opacity-80 text-center">Net Profit</div>
        <div className="text-3xl text-center font-bold">
          PKR {stats.income - stats.expense}
        </div>
      </div>

      <div className="bg-yellow-500 text-black p-5 rounded-2xl shadow-lg border border-yellow-400 hover:scale-105 hover:border-black transition">
        <div className="text-sm opacity-80 text-center">Pending</div>
        <div className="text-3xl text-center font-bold">PKR {stats.pending}</div>
      </div>
    </div>

    {/* 📊 Truck Mileage */}
    <div className="mt-8 bg-gray-800 p-5 rounded-2xl shadow hover:shadow-orange-500/40 transition">
      <h3 className="font-semibold mb-2 text-lg">Truck Mileage</h3>
      <p>
        This Month: <span className="font-bold text-[var(--orange)]">{stats.mileage} km</span>
      </p>
    </div>

    {/* Chart */}
    <div className="mt-8 bg-gray-800 p-5 rounded-2xl shadow hover:shadow-blue-500/40 transition">
      <h3 className="font-semibold mb-4 text-lg">📈 Activity Overview</h3>
      <Chart data={stats.activity} />
    </div>

    {/* Popup */}
    {showPopup && (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md text-center border-t-4 border-[var(--orange)]">
          <h3 className="text-xl font-bold text-red-600 mb-2">⚠ Oil Change Reminder</h3>
          <p className="mb-4 text-gray-700">
            Truck mileage has reached <b>{stats.mileage} km</b>.<br />
            Please schedule an oil change soon.
          </p>
          <button
            onClick={handleClearMileage}
            className="px-6 py-2 bg-[var(--orange)] text-white rounded-lg shadow hover:bg-orange-700 hover:scale-105 transition"
          >
            Clear Mileage
          </button>
        </div>
      </div>
    )}
  </section>
);

}
