import { Link } from "react-router-dom";

function Terms() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-300">
      <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
          <Link to="/" className="text-sm font-medium text-blue-400 hover:text-blue-300">← Back</Link>
        </div>
        <p className="text-xs text-slate-500">Last updated: November 2026</p>
        <section className="space-y-2 text-sm leading-6">
          <h2 className="text-base font-semibold text-white">1. Acceptable Use</h2>
          <p>You agree to use Code Review AI only for lawful software development and educational purposes and not to submit malicious payloads or attempt to bypass rate limits or security controls.</p>
        </section>
        <section className="space-y-2 text-sm leading-6">
          <h2 className="text-base font-semibold text-white">2. AI-Generated Feedback Disclaimer</h2>
          <p>Automated static analysis and AI-generated code reviews are advisory tools. You remain responsible for testing, reviewing, and validating all code before deploying to production.</p>
        </section>
        <section className="space-y-2 text-sm leading-6">
          <h2 className="text-base font-semibold text-white">3. Account Responsibility</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity conducted under your account.</p>
        </section>
      </article>
    </main>
  );
}

export default Terms;
