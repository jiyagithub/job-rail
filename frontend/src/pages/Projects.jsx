import { useState } from "react";
import { LuPlus, LuFolderKanban } from "react-icons/lu";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Modal from "../components/ui/Modal";
import Skeleton from "../components/ui/Skeleton";
import { useProjects } from "../hooks/useProjects";
import { useOrganizations } from "../hooks/useOrganizations";

function Projects() {
  const { projects, loading, error, createProject } = useProjects();
  const { organizations, loading: orgsLoading } = useOrganizations();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function orgNameFor(organizationId) {
    const org = organizations.find((o) => o.id === organizationId);
    return org ? org.name : "Unknown Organization";
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await createProject(name, description, organizationId);
      setName("");
      setDescription("");
      setOrganizationId("");
      setModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  const noOrganizations = !orgsLoading && organizations.length === 0;

  return (
    <DashboardLayout title="Projects">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? "Loading..." : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
        </p>
        <button
          onClick={() => setModalOpen(true)}
          disabled={noOrganizations}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LuPlus size={16} /> New Project
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {noOrganizations && (
        <div className="mb-6 text-sm text-yellow-700 bg-yellow-50 dark:bg-yellow-500/10 dark:text-yellow-400 rounded-lg px-4 py-3">
          You need an organization before you can create a project.{" "}
          <Link to="/organizations" className="underline font-medium">
            Create one here
          </Link>
          .
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <LuFolderKanban size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No projects yet. Create your first one to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
                <LuFolderKanban size={18} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {project.description || "No description"}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded-full">
                  {orgNameFor(project.organization_id)}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-600">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Project">
        {formError && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-3 py-2">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Organization
            </label>
            <select
              required
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="" disabled>
                Select an organization
              </option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Website Redesign"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="What is this project for?"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg py-2 transition-colors disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Project"}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default Projects;