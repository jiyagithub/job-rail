import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { LuPlus, LuBriefcase, LuClock, LuArrowLeft, LuChevronDown, LuChevronUp } from "react-icons/lu";
import DashboardLayout from "../components/layout/DashboardLayout";
import Modal from "../components/ui/Modal";
import Skeleton from "../components/ui/Skeleton";
import StatusBadge from "../components/ui/StatusBadge";
import { useQueues } from "../hooks/useQueues";
import { useJobs } from "../hooks/useJobs";
import { useJobLogs } from "../hooks/useJobLogs";
import { useJobExecutions } from "../hooks/useJobExecutions";

const JOB_TYPES = [
  { value: "immediate", label: "Immediate", hint: "Run right away" },
  { value: "delayed", label: "Delayed", hint: "Run after a short wait" },
  { value: "scheduled", label: "Scheduled", hint: "Run at an exact time" },
  { value: "recurring", label: "Recurring", hint: "Run repeatedly" },
];

function JobRow({ job }) {
  const [expanded, setExpanded] = useState(false);
  const { logs, loading: logsLoading } = useJobLogs(expanded ? job.id : null);
  const { executions, loading: execLoading } = useJobExecutions(expanded ? job.id : null);

  return (
    <>
      <tr
        onClick={() => setExpanded((v) => !v)}
        className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">
          <span className="flex items-center gap-2">
            {expanded ? <LuChevronUp size={14} /> : <LuChevronDown size={14} />}
            {job.job_name}
          </span>
        </td>
        <td className="px-5 py-3 text-gray-500 dark:text-gray-400 capitalize">{job.job_type}</td>
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

      {expanded && (
        <tr className="bg-gray-50 dark:bg-gray-950/50">
          <td colSpan={6} className="px-5 py-4">
            {job.payload?.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                <span className="font-medium">Task:</span> {job.payload.description}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-2">Logs</h4>
                {logsLoading ? (
                  <Skeleton className="h-16" />
                ) : logs.length === 0 ? (
                  <p className="text-xs text-gray-400">No logs yet.</p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {logs.map((log) => (
                      <div key={log.id} className="text-xs font-mono">
                        <span
                          className={`font-semibold ${
                            log.log_level === "ERROR"
                              ? "text-red-500"
                              : log.log_level === "WARNING"
                              ? "text-yellow-600"
                              : "text-gray-400"
                          }`}
                        >
                          [{log.log_level}]
                        </span>{" "}
                        <span className="text-gray-600 dark:text-gray-300">{log.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-2">Execution attempts</h4>
                {execLoading ? (
                  <Skeleton className="h-16" />
                ) : executions.length === 0 ? (
                  <p className="text-xs text-gray-400">No execution attempts yet.</p>
                ) : (
                  <div className="space-y-1">
                    {executions.map((exec) => (
                      <div key={exec.id} className="text-xs flex items-center gap-2">
                        <span className="text-gray-400">#{exec.attempt_number}</span>
                        <StatusBadge status={exec.status} />
                        {exec.error_message && (
                          <span className="text-red-500 truncate">{exec.error_message}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function QueueDetail() {
  const { orgId, projectId, queueId } = useParams();
  const { queues, loading: queuesLoading } = useQueues(projectId);
  const { jobs, loading, error, createJob } = useJobs(queueId);

  const queue = queues.find((q) => String(q.id) === queueId);

  const [modalOpen, setModalOpen] = useState(false);
  const [jobName, setJobName] = useState("");
  const [priority, setPriority] = useState(0);
  const [maxRetries, setMaxRetries] = useState(3);
  const [jobType, setJobType] = useState("immediate");
  const [delayMinutes, setDelayMinutes] = useState(5);
  const [scheduledAt, setScheduledAt] = useState("");
  const [recurrenceMinutes, setRecurrenceMinutes] = useState(60);
  const [taskDescription, setTaskDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await createJob({
        queue_id: queueId,
        job_name: jobName,
        payload: { description: taskDescription },
        priority: Number(priority),
        max_retries: Number(maxRetries),
        job_type: jobType,
        delay_minutes: jobType === "delayed" ? Number(delayMinutes) : undefined,
        scheduled_at: jobType === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        recurrence_interval_minutes: jobType === "recurring" ? Number(recurrenceMinutes) : undefined,
      });
      setJobName("");
      setPriority(0);
      setMaxRetries(3);
      setJobType("immediate");
      setDelayMinutes(5);
      setScheduledAt("");
      setRecurrenceMinutes(60);
      setTaskDescription("");
      setModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout title={queue ? queue.name : "Queue"}>
      <Link
        to={`/organizations/${orgId}/projects/${projectId}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4"
      >
        <LuArrowLeft size={14} /> Back to queues
      </Link>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading || queuesLoading ? "Loading..." : `${jobs.length} job${jobs.length === 1 ? "" : "s"}`}
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <LuPlus size={16} /> New Job
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
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
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Retries</th>
                <th className="px-5 py-3 font-medium">Scheduled</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <JobRow key={job.id} job={job} />
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
              placeholder="Send welcome email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              What should this job do?
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Describe the task in plain words, e.g. 'Send a welcome email to new signups'"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              When should it run?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {JOB_TYPES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setJobType(option.value)}
                  className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                    jobType === option.value
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                      : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{option.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{option.hint}</div>
                </button>
              ))}
            </div>
          </div>

          {jobType === "delayed" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Run after how many minutes?
              </label>
              <input
                type="number"
                min="1"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          {jobType === "scheduled" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Run at exactly...
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          {jobType === "recurring" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Repeat every how many minutes?
              </label>
              <input
                type="number"
                min="1"
                value={recurrenceMinutes}
                onChange={(e) => setRecurrenceMinutes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

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

export default QueueDetail;