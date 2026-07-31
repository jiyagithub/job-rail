import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { LuPlus, LuFolderKanban, LuArrowLeft, LuArrowRight } from "react-icons/lu";
import DashboardLayout from "../components/layout/DashboardLayout";
import Modal from "../components/ui/Modal";
import Skeleton from "../components/ui/Skeleton";
import { useOrganizations } from "../hooks/useOrganizations";
import { useProjects } from "../hooks/useProjects";

function OrganizationDetail() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const { projects, loading, error, createProject } = useProjects();

  const org = organizations.find((o) => String(o.id) === orgId);
  const orgProjects = projects.filter((p) => String(p.organization_id) === orgId);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justCreated, setJustCreated] = useState(null);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const project = await createProject(name, description, orgId);
      setName("");
      setDescription("");
      setModalOpen(false);
      setJustCreated(project);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout title={org ? org.name : "Organization"}>
      <Link
        to="/organizations"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4"
      >
        <LuArrowLeft size={14} /> All organizations
      </Link>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading || orgsLoading
            ? "Loading..."
            : `${orgProjects.length} project${orgProjects.length === 1 ? "" : "s"} in this organization`}
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <LuPlus size={16} /> New Project
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {justCreated && (
        <div className="mb-6 flex items-center justify-between gap-3 text-sm bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg px-4 py-3">
          <span>
            <strong>{justCreated.name}</strong> created. Next, create a queue inside it.
          </span>
          <button
            onClick={() => navigate(`/organizations/${orgId}/projects/${justCreated.id}`)}
            className="flex items-center gap-1 font-medium underline shrink-0"
          >
            Go create a queue <LuArrowRight size={14} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : orgProjects.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <LuFolderKanban size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No projects yet. Create your first one to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgProjects.map((project) => (
            <Link
              to={`/organizations/${orgId}/projects/${project.id}`}
              key={project.id}
              className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
                <LuFolderKanban size={18} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {project.description || "No description"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-3">
                Created {new Date(project.created_at).toLocaleDateString()}
              </p>
            </Link>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
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

export default OrganizationDetail;