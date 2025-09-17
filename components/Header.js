export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Truck Management</h1>
        <nav>
          <a href="/" className="mr-4">Home</a>
          <a href="/drivers" className="mr-4">Drivers</a>
          <a href="/trucks" className="mr-4">Trucks</a>
          <a href="/logs" className="mr-4">Daily Logs</a>
        </nav>
      </div>
    </header>
  )
}
