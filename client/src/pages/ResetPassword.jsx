import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../services/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Missing password reset token. Please use the link from your email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-10">
      <div className="fixed top-4 right-4 left-4 z-30 mx-auto flex max-w-5xl items-center justify-between">
        <Logo />
        <ThemeToggle />
      </div>
      <section className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs dark:shadow-none p-8 shadow-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
            CR
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Code Review AI</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Set new password</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Reset password</h2>

        {success ? (
          <div className="mt-6 space-y-5">
            <p className="rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Link
              to="/login"
              className="block w-full rounded-lg bg-indigo-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-indigo-500">
              Go to Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                New password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                placeholder="Re-enter your password"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-rose-700 dark:text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Updating password..." : "Update password"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default ResetPassword;
