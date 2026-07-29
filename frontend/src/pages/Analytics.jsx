import { LuChartBar } from "react-icons/lu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "../components/layout/DashboardLayout";
import Skeleton from "../components/ui/Skeleton";
import { useAllQueueAnalytics } from "../hooks/useAllQueueAnalytics";

function Analytics() {
  const { rows, loading, error } = useAllQueueAnalytics();

  const chartData = rows.map((r) => ({
    name: r.queueName,
    successRate: Number(r.successRate) || 0,
  }));

  return (
    <DashboardLayout title="Analytics">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Comparing success rate and volume across every queue you own.
      </p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-40" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <LuChartBar size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No queues yet. Once you create queues with job activity, comparisons will show up here.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Success Rate by Queue
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="successRate" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-5 py-3 font-medium">Queue</th>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Total Jobs</th>
                  <th className="px-5 py-3 font-medium">Completed</th>
                  <th className="px-5 py-3 font-medium">Failed</th>
                  <th className="px-5 py-3 font-medium">Success Rate</th>
                  <th className="px-5 py-3 font-medium">Avg Execution</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.queueId} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">{r.queueName}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{r.projectName}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{r.totalJobs}</td>
                    <td className="px-5 py-3 text-green-600">{r.completedJobs}</td>
                    <td className="px-5 py-3 text-red-600">{r.failedJobs}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{r.successRate}%</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{r.averageExecutionSeconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default Analytics;