import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";

function Submissions() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stageText, setStageText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [review, setReview] = useState(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await apiRequest("/projects");
        const items = response.data?.projects ?? [];
        setProjects(items);
        if (items.length) setProjectId(items[0].id);
      } catch (err) {
        setError(err.message || "Could not load projects.");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setReview(null);

    if (!projectId) {
      setError("Please select or create a project first.");
      return;
    }

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError("Please paste or write the code you want to review.");
      return;
    }

    if (trimmedCode.length < 5) {
      setError("Code snippet is too short for a meaningful review.");
      return;
    }

    if (trimmedCode.length > 50000) {
      setError("Code exceeds the 50,000 character limit.");
      return;
    }

    setSubmitting(true);
    setStageText("Saving code submission...");

    try {
      const submissionResponse = await apiRequest(
        `/projects/${projectId}/submissions`,
        {
          method: "POST",
          body: JSON.stringify({
            code: trimmedCode,
            language,
            requirements: requirements.trim(),
          }),
        }
      );

      const submission = submissionResponse.data?.submission;

      if (!submission?.id) {
        throw new Error("Submission was created, but no submission ID was returned.");
      }

      setStageText("Running static analysis & Gemini AI review...");

      const reviewResponse = await apiRequest(
        `/submissions/${submission.id}/consolidated-review`,
        { method: "POST", body: JSON.stringify({}) }
      );

      setReview(reviewResponse.data?.report ?? reviewResponse.data);
      setSuccess("Code review completed successfully.");
    } catch (err) {
      setError(err.message || "Could not complete code review.");
    } finally {
      setSubmitting(false);
      setStageText("");
    }
  }

  const aiData = review?.aiReview || review?.review || review;
  const issues = Array.isArray(aiData?.issues) ? aiData.issues : [];
  const strengths = Array.isArray(aiData?.strengths) ? aiData.strengths : [];
  const recommendations = Array.isArray(aiData?.recommendations)
    ? aiData.recommendations
    : [];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section>
        <p className="text-sm font-medium text-blue-400">CODE ANALYSIS</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Submit Code</h1>
        <p className="mt-2 text-slate-400">
          Submit your code and run static analysis with an AI-powered review.
        </p>
      </section>

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </p>
      )}

      {submitting && stageText && (
        <div role="status" className="flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-200">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          <span>{stageText}</span>
        </div>
      )}

      {!submitting && success && (
        <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {success}
        </p>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="h-5 w-32 rounded bg-slate-800" />
          <div className="h-11 w-full rounded-lg bg-slate-800" />
          <div className="h-11 w-full rounded-lg bg-slate-800" />
          <div className="h-40 w-full rounded-lg bg-slate-800" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl text-blue-400">
            ⌘
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">
            No project selected
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            You need at least one project before submitting code for review.
          </p>
          <Link
            to="/projects"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Go to Projects →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="project" className="mb-2 block text-sm font-medium text-slate-300">
                Project
              </label>
              <select
                id="project"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="language" className="mb-2 block text-sm font-medium text-slate-300">
                Programming language
              </label>
              <select
                id="language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="requirements" className="mb-2 block text-sm font-medium text-slate-300">
              Requirements (optional)
            </label>
            <textarea
              id="requirements"
              value={requirements}
              onChange={(event) => setRequirements(event.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="What should this code do?"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="code" className="block text-sm font-medium text-slate-300">
                Your code
              </label>
              <span className="text-xs text-slate-500">{code.length.toLocaleString()} chars</span>
            </div>
            <textarea
              id="code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
              rows={14}
              spellCheck={false}
              placeholder={"function add(a, b) {\n  return a + b;\n}"}
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-4 font-mono text-sm text-emerald-200 outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Reviewing code..." : "Run AI Code Review"}
          </button>
        </form>
      )}

      {review && (
        <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Review Results</h2>
              {aiData?.category && (
                <p className="mt-1 text-xs uppercase tracking-wider text-blue-400">
                  Category: {aiData.category}
                </p>
              )}
            </div>
            {typeof aiData?.overallScore === "number" && (
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-right">
                <p className="text-xs text-slate-400">Quality Score</p>
                <p className="text-2xl font-bold text-blue-300">{aiData.overallScore}/100</p>
              </div>
            )}
          </div>

          {aiData?.summary && (
            <div className="rounded-xl bg-slate-950 p-4">
              <h3 className="text-sm font-semibold text-slate-300">Summary</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{aiData.summary}</p>
            </div>
          )}

          {issues.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">
                Detected Issues ({issues.length})
              </h3>
              {issues.map((issue, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs font-semibold uppercase text-amber-300">
                      {issue.severity || "issue"}
                    </span>
                    {issue.lineNumber && (
                      <span className="text-xs text-slate-400">Line {issue.lineNumber}</span>
                    )}
                    <p className="font-medium text-white">{issue.title}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{issue.description}</p>
                  {issue.suggestion && (
                    <p className="mt-2 rounded bg-slate-900 p-2.5 text-xs text-emerald-300">
                      Suggestion: {issue.suggestion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {(strengths.length > 0 || recommendations.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {strengths.length > 0 && (
                <div className="rounded-xl bg-slate-950 p-4">
                  <h3 className="text-sm font-semibold text-emerald-300">Strengths</h3>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-300">
                    {strengths.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendations.length > 0 && (
                <div className="rounded-xl bg-slate-950 p-4">
                  <h3 className="text-sm font-semibold text-blue-300">Recommendations</h3>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-300">
                    {recommendations.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <details className="rounded-lg border border-slate-800 bg-slate-950 p-3">
            <summary className="cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-200">
              View raw JSON report
            </summary>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs text-slate-300">
              {JSON.stringify(review, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </div>
  );
}

export default Submissions;
