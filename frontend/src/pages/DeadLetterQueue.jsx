import { LuSkull } from "react-icons/lu";
import DashboardLayout from "../components/layout/DashboardLayout";
import Skeleton from "../components/ui/Skeleton";
import { useDeadLetterJobs } from "../hooks/useDeadLetterJobs";

function DeadLetterQueue() {
  const { deadLetterJobs, loading, error } = useDeadLetterJobs();

  return (
    <DashboardLayout title="Dead Letter Queue">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {loading ? "Loading..." : `${deadLetterJobs.length} job${deadLetterJobs.length === 1 ? "" : "s"} exceeded max retries and were moved here`}
      </p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : deadLetterJobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <LuSkull size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Nothing here yet — jobs land here only after exceeding their max retry limit.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deadLetterJobs.map((dlj) => (
            <div
              key={dlj.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-900/30 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <LuSkull size={16} className="text-red-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{dlj.job_name}</h3>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-600">
                  Moved {new Date(dlj.moved_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Queue: <span className="font-medium">{dlj.queue_name}</span> · Priority: {dlj.priority} · Final retry count: {dlj.retry_count}
              </p>
              {dlj.error_message && (
                <p className="text-xs text-red-500 mt-2 font-mono bg-red-50 dark:bg-red-900/10 rounded-lg px-3 py-2">
                  {dlj.error_message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default DeadLetterQueue;