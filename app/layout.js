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
        <header className="w-full bg-[var(--navy)] text-white">
          <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[var(--orange)] flex items-center justify-center font-bold">T.M</div>
              <span className="font-semibold text-lg">Truck Management</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex gap-6 items-center">
              <Link href="/drivers" className="hover:text-[var(--orange)]">Drivers</Link>
              <Link href="/trips" className="hover:text-[var(--orange)]">Trips</Link>
              <Link href="/trucks" className="hover:text-[var(--orange)]">Trucks</Link>
              <Link href="/dealier" className="hover:text-[var(--orange)]">Dealer</Link>
            </nav>

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden bg-white/10 px-3 py-2 rounded text-sm"
              aria-label="Toggle menu"
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>

          {/* Mobile nav */}
          {open && (
            <div className="md:hidden bg-[var(--navy)]/95 border-t border-white/10">
              <div className="px-4 py-4 flex flex-col gap-2">
                <Link href="/drivers" className="py-2">Drivers</Link>
                <Link href="/trips" className="py-2">Trips</Link>
                <Link href="/trucks" className="py-2">Trucks</Link>
                <Link href="/dealier" className="py-2">Dealier</Link>
              </div>
            </div>
          )}
        </header>
      

        {/* Main */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-6">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
