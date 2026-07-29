import { useState } from "react";
import { LuHistory } from "react-icons/lu";
import DashboardLayout from "../components/layout/DashboardLayout";
import Skeleton from "../components/ui/Skeleton";
import StatusBadge from "../components/ui/StatusBadge";
import { useProjects } from "../hooks/useProjects";
import { useQueues } from "../hooks/useQueues";
import { useJobs } from "../hooks/useJobs";
import { useJobExecutions } from "../hooks/useJobExecutions";

function ExecutionHistory() {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const { queues } = useQueues(selectedProjectId || null);
  const [selectedQueueId, setSelectedQueueId] = useState("");
  const { jobs } = useJobs(selectedQueueId || null);
  const [selectedJobId, setSelectedJobId] = useState("");
  const { executions, loading, error } = useJobExecutions(selectedJobId || null);

  return (
    <DashboardLayout title="Execution History">
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
          <LuHistory size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Select a project, queue, and job above to view its execution history.
          </p>
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : executions.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">No execution attempts recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <th className="px-5 py-3 font-medium">Attempt</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Started</th>
                <th className="px-5 py-3 font-medium">Finished</th>
                <th className="px-5 py-3 font-medium">Error</th>
              </tr>
            </thead>
            <tbody>
              {executions.map((exec) => (
                <tr key={exec.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">#{exec.attempt_number}</td>
                  <td className="px-5 py-3"><StatusBadge status={exec.status} /></td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                    {exec.started_at ? new Date(exec.started_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                    {exec.finished_at ? new Date(exec.finished_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-5 py-3 text-red-500 text-xs max-w-xs truncate">
                    {exec.error_message || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ExecutionHistory;