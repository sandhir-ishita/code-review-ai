import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function Projects() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/projects");
      setProjects(response.data?.projects ?? []);
    } catch (err) {
      setError(err.message || "Could not load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/projects")
      .then((res) => { if (!cancelled) { setProjects(res.data?.projects ?? []); setError(""); } })
      .catch((err) => { if (!cancelled) setError(err.message || "Could not load projects."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleUpdateProject(event) {
    event.preventDefault();
    if (!editingProject) return;

    setError("");
    setSuccess("");

    const trimmedName = editName.trim();
    const trimmedDescription = editDescription.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setError("Project name must be between 2 and 100 characters.");
      return;
    }

    setUpdating(true);
    try {
      await apiRequest(`/projects/${editingProject.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: trimmedName,
          description: trimmedDescription,
        }),
      });

      setEditingProject(null);
      setSuccess("Project updated successfully.");
      await loadProjects();
    } catch (err) {
      setError(err.message || "Could not update project.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteProject(project) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(project.id);

    try {
      await apiRequest(`/projects/${project.id}`, {
        method: "DELETE",
      });

      setProjects((current) =>
        current.filter((item) => item.id !== project.id)
      );

      if (editingProject?.id === project.id) {
        setEditingProject(null);
      }

      setSuccess("Project deleted successfully.");
    } catch (err) {
      setError(err.message || "Could not delete project.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setError("Project name must be between 2 and 100 characters.");
      return;
    }

    if (trimmedDescription.length > 500) {
      setError("Description cannot exceed 500 characters.");
      return;
    }

    setSaving(true);

    try {
      await apiRequest("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: trimmedName,
          ...(trimmedDescription
            ? { description: trimmedDescription }
            : {}),
        }),
      });

      setName("");
      setDescription("");
      setShowForm(false);
      setSuccess("Project created successfully.");

      await loadProjects();
    } catch (err) {
      setError(err.message || "Could not create project.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-indigo-600 dark:text-sky-400">WORKSPACE</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Manage your codebases and organize code reviews.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((current) => !current);
            setError("");
            setSuccess("");
          }}
          className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          {showForm ? "Cancel" : "+ New Project"}
        </button>
      </section>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-rose-700 dark:text-red-300"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={loadProjects}
            className="rounded-lg border border-red-400/40 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/20"
          >
            Retry
          </button>
        </div>
      )}

      {success && (
        <p
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300"
        >
          {success}
        </p>
      )}

      {editingProject && (
        <form
          onSubmit={handleUpdateProject}
          noValidate
          className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs dark:shadow-none p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit Project</h2>

          <div>
            <label
              htmlFor="edit-project-name"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Project name
            </label>
            <input
              id="edit-project-name"
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="edit-project-description"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Description ({editDescription.length}/500)
            </label>
            <textarea
              id="edit-project-description"
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
              rows={3}
              maxLength={500}
              className="w-full resize-y rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={updating}
              className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => setEditingProject(null)}
              disabled={updating}
              className="rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs dark:shadow-none p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Create a new project
          </h2>

          <div>
            <label
              htmlFor="project-name"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Project name
            </label>
            <input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              maxLength={100}
              placeholder="e.g. My React App"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none placeholder:text-slate-500 dark:text-slate-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="project-description"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Description ({description.length}/500)
            </label>
            <textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={500}
              placeholder="What is this project about?"
              className="w-full resize-y rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none placeholder:text-slate-500 dark:text-slate-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Project"}
          </button>
        </form>
      )}

      <section>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs dark:shadow-none p-6"
              >
                <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="mt-4 h-5 w-40 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="mt-3 h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
                <div className="mt-2 h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="mt-6 flex gap-3">
                  <div className="h-9 w-16 rounded-lg bg-slate-100 dark:bg-slate-800" />
                  <div className="h-9 w-20 rounded-lg bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs dark:shadow-none/50 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl text-indigo-600 dark:text-sky-400">
              ▦
            </div>
            <h2 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
              No projects yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              Create a project to organize submissions, run static analysis,
              and generate AI-powered code reviews.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowForm(true);
                setError("");
                setSuccess("");
              }}
              className="mt-6 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              + Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs dark:shadow-none p-6 transition hover:border-slate-300 dark:border-slate-700"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-indigo-600 dark:text-sky-400">
                  ▦
                </div>
                <h2 className="mt-4 break-words text-lg font-semibold text-slate-900 dark:text-white">
                  {project.name}
                </h2>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {project.description || "No description provided."}
                </p>
                <p className="mt-5 text-xs text-slate-500 dark:text-slate-500">
                  {project.createdAt
                    ? `Created ${new Date(project.createdAt).toLocaleDateString()}`
                    : "Project"}
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProject(project);
                      setEditName(project.name);
                      setEditDescription(project.description || "");
                      setError("");
                      setSuccess("");
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 transition hover:bg-slate-100 dark:bg-slate-800"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project)}
                    disabled={deletingId === project.id}
                    className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-rose-700 dark:text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {deletingId === project.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Projects;
