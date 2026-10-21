const stats = [
  {
    label: "Total Projects",
    value: "0",
    description: "Projects created",
    icon: "▦",
  },
  {
    label: "Code Submissions",
    value: "0",
    description: "Submissions analyzed",
    icon: "⌘",
  },
  {
    label: "Reviews Completed",
    value: "0",
    description: "AI reviews generated",
    icon: "✧",
  },
  {
    label: "Issues Detected",
    value: "0",
    description: "Issues found by analysis",
    icon: "⚑",
  },
];

function Dashboard() {
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

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
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

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent Reviews
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Your latest code analysis activity
              </p>
            </div>

            <span className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400">
              All reviews
            </span>
          </div>

          <div className="mt-8 flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 px-4 text-center">
            <span className="text-3xl text-slate-500">⌘</span>
            <p className="mt-3 font-medium text-white">
              No reviews displayed yet
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
              Your code review activity will appear here when reviews are
              connected to the dashboard.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            Quick Overview
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Your review workflow
          </p>

          <div className="mt-6 space-y-5">
            {[
              ["01", "Create a project", "Organize code for review"],
              ["02", "Submit your code", "Choose a language and add requirements"],
              ["03", "Run an AI review", "Inspect issues and recommendations"],
            ].map(([number, title, description]) => (
              <div key={number} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-semibold text-blue-400">
                  {number}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
