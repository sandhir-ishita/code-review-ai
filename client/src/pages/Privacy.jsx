import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { Link } from "react-router-dom";

function Privacy() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-12 text-slate-700 dark:text-slate-300">
      <div className="fixed top-4 right-4 left-4 z-30 mx-auto flex max-w-5xl items-center justify-between">
        <Logo />
        <ThemeToggle />
      </div>
      <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs dark:shadow-none p-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
          <Link to="/" className="text-sm font-medium text-indigo-600 dark:text-sky-400 hover:text-indigo-500 dark:hover:text-sky-300">← Back</Link>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500">Last updated: November 2026</p>
        <section className="space-y-2 text-sm leading-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">1. Information We Collect</h2>
          <p>We collect your account details (name, email address, hashed password) and the projects, code snippets, and review reports you create within Code Review AI.</p>
        </section>
        <section className="space-y-2 text-sm leading-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">2. How We Use Your Data</h2>
          <p>Your code submissions are processed using static analyzers (ESLint) and AI review services solely to generate code quality feedback for your account. We do not sell your personal information or source code.</p>
        </section>
        <section className="space-y-2 text-sm leading-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">3. Data Security & Account Deletion</h2>
          <p>All sessions use signed JWT tokens with hashed refresh tokens. You may permanently delete your account and all associated projects, submissions, and reviews at any time from Account Settings.</p>
        </section>
      </article>
    </main>
  );
}

export default Privacy;
