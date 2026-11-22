import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem("code_review_onboarding_dismissed") !== "true");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest("/projects");
      setProjects(response.data?.projects ?? []);
    } catch (err) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/projects")
      .then((res) => { if (!cancelled) { setProjects(res.data?.projects ?? []); setError(""); } })
      .catch((err) => { if (!cancelled) setError(err.message || "Could not load dashboard data."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const totalSubmissions = projects.reduce(
    (sum, p) => sum + (p._count?.submissions ?? p.submissions?.length ?? 0),
    0
  );

  const stats = [
    {
      label: "Total Projects",
      value: error ? "—" : projects.length,
      description: projects.length === 1 ? "1 active project" : "Projects created",
      icon: "▦",
    },
    {
      label: "Code Submissions",
      value: error ? "—" : totalSubmissions,
      description: totalSubmissions > 0 ? "Submitted for analysis" : "Submit code to analyze",
      icon: "⌘",
    },
    {
      label: "Static & AI Engine",
      value: "Ready",
      description: "ESLint + Gemini AI active",
      icon: "✧",
    },
    {
      label: "Supported Languages",
      value: "5",
      description: "JS, TS, Python, Java, C++",
      icon: "⚑",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <p className="text-sm font-medium text-blue-400">
          WORKSPACE OVERVIEW
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Your Code Quality Dashboard
        </h1>
        <p className="mt-2 text-slate-400">
          Monitor your projects, code submissions, and AI-powered reviews.
        </p>
      </section>

      {showOnboarding && (
        <section className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-600/15 to-slate-900 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">Quick Start Guide</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Welcome to Code Review AI — 3 Steps to Get Started</h2>
            </div>
            <button
              type="button"
              onClick={() => { localStorage.setItem("code_review_onboarding_dismissed", "true"); setShowOnboarding(false); }}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
            >
              Dismiss
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3 text-sm">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="font-semibold text-white">1. Create a Project</p>
              <p className="mt-1 text-xs text-slate-400">Group your codebases and organize review history.</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="font-semibold text-white">2. Paste Your Code</p>
              <p className="mt-1 text-xs text-slate-400">Select language (JS, TS, Python, Java, C++) and requirements.</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="font-semibold text-white">3. Run AI Review</p>
              <p className="mt-1 text-xs text-slate-400">Get instant ESLint static analysis + Gemini AI suggestions.</p>
            </div>
          </div>
        </section>
      )}

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={loadDashboard}
            className="rounded-lg border border-red-400/40 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/20"
          >
            Retry
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 rounded bg-slate-800" />
                  <div className="h-10 w-10 rounded-xl bg-slate-800" />
                </div>
                <div className="mt-5 h-8 w-16 rounded bg-slate-800" />
                <div className="mt-3 h-4 w-32 rounded bg-slate-800" />
              </div>
            ))
          : stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-400">
                    {stat.icon}
                  </span>
                </div>
                <p className="mt-5 text-3xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {stat.description}
                </p>
              </article>
            ))}
      </section>

      {!loading && !error && projects.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-400">
            ▦
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">
            No projects in your workspace yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Create your first project to organize code submissions and receive detailed AI reviews.
          </p>
          <Link
            to="/projects"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            + Create First Project
          </Link>
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          <p className="mt-1 text-sm text-slate-400">
            Continue your code review workflow.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Manage Projects →
            </Link>
            <Link
              to="/submissions"
              className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Submit Code →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

export default Dashboard;
