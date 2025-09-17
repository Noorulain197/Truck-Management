export default function Footer() {
  return (
    <footer className="mt-12 bg-black text-white">
      {/* <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-2xl font-bold">
            <span className="text-[var(--orange)]">Truck</span> Management
          </h3>
          <p className="mt-2 text-slate-400 text-sm">
            Simplifying fleet management with style & efficiency.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3 text-[var(--orange)]">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-orange-400">Home</a></li>
            <li><a href="/drivers" className="hover:text-orange-400">Drivers</a></li>
            <li><a href="/trucks" className="hover:text-orange-400">Trucks</a></li>
            <li><a href="/logs" className="hover:text-orange-400">Daily Logs</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3 text-[var(--orange)]">Contact</h4>
          <p className="text-slate-400 text-sm">📍 Lahore, Pakistan</p>
          <p className="text-slate-400 text-sm">📞 +92-300-0000000</p>
          <p className="text-slate-400 text-sm">✉ support@truckapp.com</p>
        </div>
      </div> */}

      <div className="border-t border-slate-700 py-4 text-center text-slate-400 text-sm">
        © {new Date().getFullYear()} Truck Management Software. All rights reserved.
      </div>
    </footer>
  );
}
