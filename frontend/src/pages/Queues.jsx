import { useState } from "react";
import { LuPlus, LuListTree, LuPause, LuPlay, LuChartBar } from "react-icons/lu";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Modal from "../components/ui/Modal";
import Skeleton from "../components/ui/Skeleton";
import StatusBadge from "../components/ui/StatusBadge";
import QueueAnalyticsModal from "../components/queues/QueueAnalyticsModal";
import { useProjects } from "../hooks/useProjects";
import { useQueues } from "../hooks/useQueues";

function Queues() {
  const { projects, loading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const { queues, loading, error, createQueue, toggleQueueStatus } = useQueues(
    selectedProjectId || null
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(0);
  const [concurrencyLimit, setConcurrencyLimit] = useState(5);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [analyticsQueue, setAnalyticsQueue] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await createQueue({
        name,
        description,
        project_id: selectedProjectId,
        priority: Number(priority),
        concurrency_limit: Number(concurrencyLimit),
      });
      setName("");
      setDescription("");
      setPriority(0);
      setConcurrencyLimit(5);
      setModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create queue");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(queue) {
    setTogglingId(queue.id);
    try {
      const newStatus = queue.status === "active" ? "paused" : "active";
      await toggleQueueStatus(queue.id, newStatus);
    } catch (err) {
      // Silently ignore — the queue's status just won't change, which is visible feedback enough here
    } finally {
      setTogglingId(null);
    }
  }

  const noProjects = !projectsLoading && projects.length === 0;

  return (
    <DashboardLayout title="Queues">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Project:
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[200px]"
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          disabled={!selectedProjectId}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LuPlus size={16} /> New Queue
        </button>
      </div>

      {noProjects && (
        <div className="mb-6 text-sm text-yellow-700 bg-yellow-50 dark:bg-yellow-500/10 dark:text-yellow-400 rounded-lg px-4 py-3">
          You need a project before you can create a queue.{" "}
          <Link to="/projects" className="underline font-medium">
            Create one here
          </Link>
          .
        </div>
      )}

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!selectedProjectId ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <LuListTree size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Select a project above to view its queues.
          </p>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : queues.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <LuListTree size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No queues in this project yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {queues.map((queue) => (
            <div
              key={queue.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm flex items-center justify-between flex-wrap gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{queue.name}</h3>
                  <StatusBadge status={queue.status} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {queue.description || "No description"}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                  Priority: {queue.priority} · Concurrency limit: {queue.concurrency_limit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAnalyticsQueue(queue)}
                  className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <LuChartBar size={14} /> Analytics
                </button>
                <button
                  onClick={() => handleToggle(queue)}
                  disabled={togglingId === queue.id}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    queue.status === "active"
                      ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-400"
                      : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400"
                  }`}
                >
                  {queue.status === "active" ? (
                    <>
                      <LuPause size={14} /> Pause
                    </>
                  ) : (
                    <>
                      <LuPlay size={14} /> Resume
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Queue">
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
              placeholder="Email Queue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Concurrency Limit
              </label>
              <input
                type="number"
                value={concurrencyLimit}
                onChange={(e) => setConcurrencyLimit(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg py-2 transition-colors disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Queue"}
          </button>
        </form>
      </Modal>

      {analyticsQueue && (
        <QueueAnalyticsModal
          queueId={analyticsQueue.id}
          queueName={analyticsQueue.name}
          onClose={() => setAnalyticsQueue(null)}
        />
      )}
    </DashboardLayout>
  );
}

export default Queues;