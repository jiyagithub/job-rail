import { LuServer, LuActivity } from "react-icons/lu";
import DashboardLayout from "../components/layout/DashboardLayout";
import Skeleton from "../components/ui/Skeleton";
import StatusBadge from "../components/ui/StatusBadge";
import { useWorkers } from "../hooks/useWorkers";

function timeSince(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function isHealthy(lastHeartbeat) {
  const seconds = (Date.now() - new Date(lastHeartbeat).getTime()) / 1000;
  return seconds < 30; // consider a worker "stale" if no heartbeat in 30s
}

function Workers() {
  const { workers, loading, error } = useWorkers();

  return (
    <DashboardLayout title="Workers">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {loading ? "Loading..." : `${workers.length} worker${workers.length === 1 ? "" : "s"} registered · auto-refreshes every 5s`}
      </p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : workers.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <LuServer size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No workers registered yet. Run <code className="font-mono">npm run worker</code> in your backend.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((worker) => {
            const healthy = isHealthy(worker.last_heartbeat);
            return (
              <div
                key={worker.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                    <LuServer size={18} />
                  </div>
                  <StatusBadge status={worker.status} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{worker.worker_name}</h3>
                <div className="flex items-center gap-1.5 mt-2 text-xs">
                  <LuActivity size={13} className={healthy ? "text-green-500" : "text-red-500"} />
                  <span className={healthy ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                    {healthy ? "Healthy" : "Stale"} · last heartbeat {timeSince(worker.last_heartbeat)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                  Started {new Date(worker.started_at).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Workers;