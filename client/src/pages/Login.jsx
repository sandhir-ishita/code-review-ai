import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { saveAuthSession } from "../services/auth";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const payload = response.data || response;
      const accessToken =
        payload?.accessToken || payload?.token || payload?.access_token;

      if (!accessToken) {
        throw new Error(
          "Login succeeded, but no access token was found in the response."
        );
      }

      saveAuthSession({
        accessToken,
        refreshToken: payload?.refreshToken,
        user: payload?.user,
      });

      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
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
            <p className="text-sm text-slate-600 dark:text-slate-400">Welcome back</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Sign in</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Sign in to manage projects and review your code.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-indigo-600 dark:text-sky-400 hover:text-indigo-500 dark:hover:text-sky-300">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              placeholder="Enter your password"
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
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          New here? {" "}
          <Link to="/register" className="font-medium text-indigo-600 dark:text-sky-400 hover:text-indigo-500 dark:hover:text-sky-300">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
