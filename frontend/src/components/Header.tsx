export default function Header() {
  return (
    <header className="bg-slate-900 text-white py-4 px-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">🎭 Playwright Demo</h1>
        <nav>
          <span className="text-slate-400">Testing Dashboard</span>
        </nav>
      </div>
    </header>
  );
}
