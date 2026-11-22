import { Link, NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/", icon: "⌂" },
  { label: "Projects", path: "/projects", icon: "▦" },
  { label: "Submissions", path: "/submissions", icon: "⌘" },
  { label: "Settings", path: "/settings", icon: "⚙" },
];

function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 p-5 text-slate-200 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              CR
            </div>
            <div>
              <h1 className="font-semibold text-white">Code Review AI</h1>
              <p className="text-xs text-slate-400">Intelligent code analysis</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-lg border border-slate-800 px-2.5 py-1 text-sm text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            ✕
          </button>
        </div>

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Workspace
        </p>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm font-medium text-white">AI Code Review</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Find issues, understand code, and improve quality.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <Link to="/privacy" onClick={onClose} className="hover:text-slate-300">Privacy</Link>
            <span>•</span>
            <Link to="/terms" onClick={onClose} className="hover:text-slate-300">Terms</Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
