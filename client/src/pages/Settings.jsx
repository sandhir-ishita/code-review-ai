import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { clearAuthSession, getStoredUser } from "../services/auth";

function Settings() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDeleteAccount(event) {
    event.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter your password to confirm account deletion.");
      return;
    }

    const confirmed = window.confirm(
      "This will permanently delete your account, projects, code submissions, and reviews. This action cannot be undone. Continue?"
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await apiRequest("/auth/me", {
        method: "DELETE",
        body: JSON.stringify({ password }),
      });
      clearAuthSession();
      navigate("/register", { replace: true });
    } catch (err) {
      setError(err.message || "Could not delete account.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section>
        <p className="text-sm font-medium text-indigo-600 dark:text-sky-400">ACCOUNT</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Manage your profile details and account security.</p>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs dark:shadow-none p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Information</h2>
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4">
            <p className="text-slate-600 dark:text-slate-400">Name</p>
            <p className="mt-1 font-medium text-slate-900 dark:text-white">{user?.name || "—"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4">
            <p className="text-slate-600 dark:text-slate-400">Email</p>
            <p className="mt-1 font-medium text-slate-900 dark:text-white">{user?.email || "—"}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-red-500/30 bg-white dark:bg-slate-900 shadow-xs dark:shadow-none p-6">
        <h2 className="text-lg font-semibold text-rose-700 dark:text-red-300">Danger Zone — Delete Account</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Permanently remove your account and all associated projects, submissions, and AI reviews.
        </p>

        <form onSubmit={handleDeleteAccount} noValidate className="space-y-4 max-w-md">
          <div>
            <label htmlFor="delete-password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirm your password
            </label>
            <input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-red-500"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-rose-700 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={deleting}
            className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
          >
            {deleting ? "Deleting account..." : "Delete My Account"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default Settings;
