'use client'
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Footer from "../components/Footer";

export default function RootLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-[var(--navy)]">
        {/* Top Nav */}
        <header className="w-full bg-[var(--navy)] text-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-md bg-blue-500 flex items-center justify-center font-bold text-sm md:text-base">
                T.M
              </div>
              <span className="font-semibold text-lg md:text-xl">Truck Management</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex gap-6 items-center font-medium">
              <Link href="/drivers" className="hover:text-blue-500 transition-colors">Drivers</Link>
              <Link href="/trips" className="hover:text-blue-500 transition-colors">Trips</Link>
              <Link href="/trucks" className="hover:text-blue-500 transition-colors">Trucks</Link>
              <Link href="/dealers" className="hover:text-blue-500 transition-colors">Dealer</Link>
              <Link href="/tyres" className="hover:text-blue-500 transition-colors">Tyres</Link>

            </nav>

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden bg-white/20 px-3 py-2 rounded text-sm hover:bg-white/30 transition"
              aria-label="Toggle menu"
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>

          {/* Mobile nav */}
          {open && (
            <div className="md:hidden bg-[var(--navy)]/95 border-t border-white/20 animate-slide-down">
              <div className="px-4 py-4 flex flex-col gap-2">
                <Link href="/drivers" className="py-2 px-2 rounded hover:bg-[var(--orange)] hover:text-white transition">Drivers</Link>
                <Link href="/trips" className="py-2 px-2 rounded hover:bg-[var(--orange)] hover:text-white transition">Trips</Link>
                <Link href="/trucks" className="py-2 px-2 rounded hover:bg-[var(--orange)] hover:text-white transition">Trucks</Link>
                <Link href="/dealier" className="py-2 px-2 rounded hover:bg-[var(--orange)] hover:text-white transition">Dealer</Link>
                <Link href="/tyres" className="hover:text-blue-500 transition-colors">Tyres</Link>
              </div>
            </div>
          )}
        </header>

        {/* Main */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-6">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );

}
