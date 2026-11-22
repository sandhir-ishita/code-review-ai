import { Link } from "react-router-dom";

function Privacy() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-300">
      <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
          <Link to="/" className="text-sm font-medium text-blue-400 hover:text-blue-300">← Back</Link>
        </div>
        <p className="text-xs text-slate-500">Last updated: November 2026</p>
        <section className="space-y-2 text-sm leading-6">
          <h2 className="text-base font-semibold text-white">1. Information We Collect</h2>
          <p>We collect your account details (name, email address, hashed password) and the projects, code snippets, and review reports you create within Code Review AI.</p>
        </section>
        <section className="space-y-2 text-sm leading-6">
          <h2 className="text-base font-semibold text-white">2. How We Use Your Data</h2>
          <p>Your code submissions are processed using static analyzers (ESLint) and AI review services solely to generate code quality feedback for your account. We do not sell your personal information or source code.</p>
        </section>
        <section className="space-y-2 text-sm leading-6">
          <h2 className="text-base font-semibold text-white">3. Data Security & Account Deletion</h2>
          <p>All sessions use signed JWT tokens with hashed refresh tokens. You may permanently delete your account and all associated projects, submissions, and reviews at any time from Account Settings.</p>
        </section>
      </article>
    </main>
  );
}

export default Privacy;
