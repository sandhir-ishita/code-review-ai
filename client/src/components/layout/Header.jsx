import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "../../services/auth";
import { logoutApi } from "../../services/api";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Header({ onOpenMenu = () => {} }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const user = getStoredUser();

  const displayName = user?.name || "Developer";
  const displayEmail = user?.email || "Developer";
  const initials = getInitials(user?.name);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutApi();
    navigate("/login", { replace: true });
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
          className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-800 lg:hidden"
        >
          ☰
        </button>

        <div>
          <h2 className="text-base font-semibold text-white sm:text-lg">Workspace</h2>
          <p className="hidden text-sm text-slate-400 sm:block">
            Welcome back! Here&apos;s your code quality overview.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
            {initials}
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-medium text-white">{displayName}</p>
            <p className="text-xs text-slate-400">{displayEmail}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50 sm:px-3.5 sm:text-sm"
        >
          {loggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}

export default Header;
