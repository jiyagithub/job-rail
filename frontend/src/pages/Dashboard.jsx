import {
  LuBuilding2,
  LuFolderKanban,
  LuListTree,
  LuBriefcase,
  LuCheck,
  LuX,
  LuRefreshCw,
  LuArrowRight,
} from "react-icons/lu";
import { Link } from "react-router-dom";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import Skeleton from "../components/ui/Skeleton";
import { useDashboardStats } from "../hooks/useDashboardStats";

const STATUS_COLORS = {
  Pending: "#eab308",
  Running: "#3b82f6",
  Completed: "#22c55e",
  Failed: "#ef4444",
};

function Dashboard() {
  const { stats, recentJobs, loading, error } = useDashboardStats();

  const chartData = stats
    ? [
        { name: "Pending", value: stats.pendingJobs },
        { name: "Running", value: stats.runningJobs },
        { name: "Completed", value: stats.completedJobs },
        { name: "Failed", value: stats.failedJobs },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <DashboardLayout title="Dashboard">
      <Link
        to="/organizations"
        className="mb-6 flex items-center justify-between gap-3 bg-brand-600 hover:bg-brand-700 transition-colors text-white rounded-2xl px-5 py-4 shadow-sm"
      >
        <div>
          <h2 className="font-semibold">Get started</h2>
          <p className="text-sm text-brand-100">
            Create an organization to begin setting up your projects, queues, and jobs.
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-sm font-medium shrink-0 bg-white/15 rounded-lg px-3 py-2">
          Go to Organizations <LuArrowRight size={16} />
        </span>
      </Link>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : (
          <>
            <StatCard label="Organizations" value={stats.totalOrganizations} icon={LuBuilding2} accent="brand" />
            <StatCard label="Projects" value={stats.totalProjects} icon={LuFolderKanban} accent="brand" />
            <StatCard label="Queues" value={stats.totalQueues} icon={LuListTree} accent="brand" />
            <StatCard label="Total Jobs" value={stats.totalJobs} icon={LuBriefcase} accent="brand" />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : (
          <>
            <StatCard label="Completed" value={stats.completedJobs} icon={LuCheck} accent="green" />
            <StatCard label="Failed" value={stats.failedJobs} icon={LuX} accent="red" />
            <StatCard label="Retries" value={stats.totalRetries} icon={LuRefreshCw} accent="yellow" />
            <StatCard label="Success Rate" value={`${stats.successRate}%`} icon={LuCheck} accent="green" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent jobs table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Jobs</h2>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-400">
              No jobs yet. Once you create a Queue and a Job, they'll show up here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    <th className="px-5 py-2 font-medium">Job</th>
                    <th className="px-5 py-2 font-medium">Queue</th>
                    <th className="px-5 py-2 font-medium">Status</th>
                    <th className="px-5 py-2 font-medium">Retries</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map((job) => (
                    <tr key={job.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                      <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">
                        {job.job_name}
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                        {job.queue_name}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                        {job.retry_count}/{job.max_retries}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Status breakdown chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Job Status Breakdown</h2>
          {loading ? (
            <Skeleton className="h-56" />
          ) : chartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-gray-400 text-center px-4">
              No job data yet to chart.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;