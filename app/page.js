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
    <section>
      {/* Banner */}
      <div className="relative overflow-hidden shadow-lg mb-8">
        <Image
          src="/images/3truck.jpg"
          alt="trucks"
          width={1200}
          height={400}
          className="w-full h-48 md:h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-[var(--orange)]/20 to-black/60 flex flex-col justify-center items-center text-center text-white p-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-2">
            Efficient Truck Management
          </h2>
          <p className="max-w-2xl text-sm md:text-base opacity-90">
            Streamline drivers, trucks, and daily logs with a modern,
            <span className="text-orange-600"> mobile-friendly system.</span>
          </p>
          <a
            href="/trips"
            className="mt-4 inline-block px-6 py-2 bg-[var(--orange)] hover:bg-orange-700 rounded text-white font-semibold transition"
          >
            Get Started
          </a>
        </div>
      </div>

      {/* 🚚 Financial Overview */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className="bg-green-600 text-white p-5 rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm opacity-80 text-center">Income</div>
          <div className="text-3xl text-center font-bold">PKR {stats.income}</div>
        </motion.div>

        <motion.div
          className="bg-red-600 text-white p-5 rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm opacity-80 text-center">Expenses</div>
          <div className="text-3xl text-center font-bold">PKR {stats.expense}</div>
        </motion.div>

        <motion.div
          className="bg-blue-600 text-white p-5 rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm opacity-80 text-center">Total Income</div>
          <div className="text-3xl text-center font-bold">
            PKR {stats.income - stats.expense}
          </div>
        </motion.div>

        <motion.div
          className="bg-yellow-500 text-black p-5 rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm opacity-80 text-center">Amount Pending</div>
          <div className="text-3xl text-center font-bold">PKR {stats.pending}</div>
        </motion.div>
      </div>

      {/* 🚛 Truck Mileage */}
      <div className="mt-8 bg-white p-5 rounded-2xl shadow">
        <h3 className="font-semibold mb-2 text-lg">Truck Mileage</h3>
        <p>This Month: <span className="font-bold">{stats.mileage} km</span></p>
      </div>

      {/* 📈 Chart */}
      <div className="mt-8 bg-white p-5 rounded-2xl shadow">
        <h3 className="font-semibold mb-4 text-lg">📈 Activity</h3>
        <Chart data={stats.activity} />
      </div>

      {/* ⚠️ Popup Notification */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md text-center">
            <h3 className="text-xl font-bold text-red-600 mb-2">
              ⚠ Oil Change Reminder
            </h3>
            <p className="mb-4">
              Truck mileage has reached <b>{stats.mileage} km</b>.  
              Please schedule an oil change.  
            </p>
            <button
              onClick={handleClearMileage}
              className="px-6 py-2 bg-[var(--orange)] text-white rounded-lg shadow hover:bg-orange-700 transition"
            >
              Clear Mileage
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
