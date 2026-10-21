function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950 px-8">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Welcome back! Here's your code quality overview.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800"
        >
          <span aria-hidden="true">♧</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
            IS
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">
              Ishita
            </p>
            <p className="text-xs text-slate-400">
              Developer
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
