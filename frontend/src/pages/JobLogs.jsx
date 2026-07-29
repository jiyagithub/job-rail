import { useState } from "react";
import { LuFileText } from "react-icons/lu";
import DashboardLayout from "../components/layout/DashboardLayout";
import Skeleton from "../components/ui/Skeleton";
import { useProjects } from "../hooks/useProjects";
import { useQueues } from "../hooks/useQueues";
import { useJobs } from "../hooks/useJobs";
import { useJobLogs } from "../hooks/useJobLogs";

const LOG_LEVEL_COLORS = {
  info: "text-blue-600 dark:text-blue-400",
  error: "text-red-600 dark:text-red-400",
  warn: "text-yellow-600 dark:text-yellow-400",
  warning: "text-yellow-600 dark:text-yellow-400",
};

function JobLogs() {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const { queues } = useQueues(selectedProjectId || null);
  const [selectedQueueId, setSelectedQueueId] = useState("");
  const { jobs } = useJobs(selectedQueueId || null);
  const [selectedJobId, setSelectedJobId] = useState("");
  const { logs, loading, error } = useJobLogs(selectedJobId || null);

  return (
    <DashboardLayout title="Job Logs">
      <div className="flex items-center gap-3 flex-wrap mb-6">
        <select
          value={selectedProjectId}
          onChange={(e) => {
            setSelectedProjectId(e.target.value);
            setSelectedQueueId("");
            setSelectedJobId("");
          }}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[180px]"
        >
          <option value="">Select a project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={selectedQueueId}
          onChange={(e) => {
            setSelectedQueueId(e.target.value);
            setSelectedJobId("");
          }}
          disabled={!selectedProjectId}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[180px] disabled:opacity-50"
        >
          <option value="">Select a queue</option>
          {queues.map((q) => (
            <option key={q.id} value={q.id}>{q.name}</option>
          ))}
        </select>

        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          disabled={!selectedQueueId}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[180px] disabled:opacity-50"
        >
          <option value="">Select a job</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>{j.job_name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!selectedJobId ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <LuFileText size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Select a project, queue, and job above to view its logs.
          </p>
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">No logs recorded for this job.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden font-mono text-xs">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 px-4 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0"
            >
              <span className="text-gray-400 whitespace-nowrap">
                {new Date(log.created_at).toLocaleTimeString()}
              </span>
              <span className={`uppercase font-semibold whitespace-nowrap ${LOG_LEVEL_COLORS[log.log_level] || "text-gray-500"}`}>
                {log.log_level}
              </span>
              <span className="text-gray-700 dark:text-gray-300">{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default JobLogs;