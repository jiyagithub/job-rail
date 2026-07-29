import { useState } from "react";
import { LuPlus, LuBriefcase, LuClock } from "react-icons/lu";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Modal from "../components/ui/Modal";
import Skeleton from "../components/ui/Skeleton";
import StatusBadge from "../components/ui/StatusBadge";
import { useProjects } from "../hooks/useProjects";
import { useQueues } from "../hooks/useQueues";
import { useJobs } from "../hooks/useJobs";

function Jobs() {
  const { projects, loading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const { queues, loading: queuesLoading } = useQueues(selectedProjectId || null);
  const [selectedQueueId, setSelectedQueueId] = useState("");
  const { jobs, loading, error, createJob } = useJobs(selectedQueueId || null);

  const [modalOpen, setModalOpen] = useState(false);
  const [jobName, setJobName] = useState("");
  const [priority, setPriority] = useState(0);
  const [maxRetries, setMaxRetries] = useState(3);
  const [scheduledAt, setScheduledAt] = useState("");
  const [payloadText, setPayloadText] = useState("{\n  \n}");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleProjectChange(id) {
    setSelectedProjectId(id);
    setSelectedQueueId(""); // reset queue when project changes, since queues belong to one project
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");

    let parsedPayload;
    try {
      parsedPayload = payloadText.trim() ? JSON.parse(payloadText) : {};
    } catch (err) {
      setFormError("Payload must be valid JSON.");
      return;
    }

    setSubmitting(true);
    try {
      await createJob({
        queue_id: selectedQueueId,
        job_name: jobName,
        payload: parsedPayload,
        priority: Number(priority),
        max_retries: Number(maxRetries),
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      });
      setJobName("");
      setPriority(0);
      setMaxRetries(3);
      setScheduledAt("");
      setPayloadText("{\n  \n}");
      setModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  }

  const noProjects = !projectsLoading && projects.length === 0;
  const noQueues = selectedProjectId && !queuesLoading && queues.length === 0;

  return (
    <DashboardLayout title="Jobs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[180px]"
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedQueueId}
            onChange={(e) => setSelectedQueueId(e.target.value)}
            disabled={!selectedProjectId}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[180px] disabled:opacity-50"
          >
            <option value="">Select a queue</option>
            {queues.map((q) => (
              <option key={q.id} value={q.id}>
                {q.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          disabled={!selectedQueueId}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LuPlus size={16} /> New Job
        </button>
      </div>

      {noProjects && (
        <div className="mb-6 text-sm text-yellow-700 bg-yellow-50 dark:bg-yellow-500/10 dark:text-yellow-400 rounded-lg px-4 py-3">
          You need a project first. <Link to="/projects" className="underline font-medium">Create one here</Link>.
        </div>
      )}
      {noQueues && (
        <div className="mb-6 text-sm text-yellow-700 bg-yellow-50 dark:bg-yellow-500/10 dark:text-yellow-400 rounded-lg px-4 py-3">
          This project has no queues yet. <Link to="/queues" className="underline font-medium">Create one here</Link>.
        </div>
      )}
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!selectedQueueId ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <LuBriefcase size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Select a project and queue above to view its jobs.
          </p>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <LuBriefcase size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No jobs in this queue yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <th className="px-5 py-3 font-medium">Job</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Retries</th>
                <th className="px-5 py-3 font-medium">Scheduled</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">{job.job_name}</td>
                  <td className="px-5 py-3"><StatusBadge status={job.status} /></td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{job.priority}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                    {job.retry_count}/{job.max_retries}
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <LuClock size={13} />
                      {new Date(job.scheduled_at).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Job">
        {formError && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-3 py-2">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Name</label>
            <input
              type="text"
              required
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="send-welcome-email"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Retries</label>
              <input
                type="number"
                value={maxRetries}
                onChange={(e) => setMaxRetries(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Scheduled At <span className="text-gray-400">(optional — leave blank to run now)</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payload (JSON)
            </label>
            <textarea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              rows={5}
              spellCheck={false}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg py-2 transition-colors disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Job"}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default Jobs;