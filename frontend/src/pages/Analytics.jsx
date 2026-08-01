import { LuChartBar, LuListTree, LuBriefcase, LuTrendingUp, LuTimer } from "react-icons/lu";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/ui/StatCard";
import Skeleton from "../components/ui/Skeleton";
import { useAllQueueAnalytics } from "../hooks/useAllQueueAnalytics";
import { useTheme } from "../context/ThemeContext";

function rateColor(rate) {
  if (rate >= 90) return "#22c55e"; // green
  if (rate >= 70) return "#eab308"; // yellow
  return "#ef4444"; // red
}

function Analytics() {
  const { darkMode } = useTheme();
  const { rows, loading, error } = useAllQueueAnalytics();

  const gridColor = darkMode ? "#374151" : "#f3f4f6";
  const axisColor = darkMode ? "#9ca3af" : "#6b7280";
  const tooltipBg = darkMode ? "#1f2937" : "#ffffff";
  const tooltipBorder = darkMode ? "#374151" : "#e5e7eb";
  const tooltipText = darkMode ? "#f3f4f6" : "#111827";

  const chartData = rows.map((r) => ({
    name: r.queueName,
    successRate: Number(r.successRate) || 0,
  }));

  const totalQueues = rows.length;
  const totalJobs = rows.reduce((sum, r) => sum + Number(r.totalJobs || 0), 0);
  const totalCompleted = rows.reduce((sum, r) => sum + Number(r.completedJobs || 0), 0);
  const totalFailed = rows.reduce((sum, r) => sum + Number(r.failedJobs || 0), 0);
  const overallSuccessRate =
    totalCompleted + totalFailed > 0
      ? Math.round((totalCompleted / (totalCompleted + totalFailed)) * 100)
      : 0;
  const avgExecution =
    rows.length > 0
      ? (
          rows.reduce((sum, r) => sum + Number(r.averageExecutionSeconds || 0), 0) / rows.length
        ).toFixed(1)
      : 0;

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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
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
          {/* Summary stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Queues" value={totalQueues} icon={LuListTree} accent="brand" />
            <StatCard label="Total Jobs" value={totalJobs} icon={LuBriefcase} accent="brand" />
            <StatCard
              label="Overall Success Rate"
              value={`${overallSuccessRate}%`}
              icon={LuTrendingUp}
              accent={overallSuccessRate >= 90 ? "green" : overallSuccessRate >= 70 ? "yellow" : "red"}
            />
            <StatCard label="Avg Execution" value={`${avgExecution}s`} icon={LuTimer} accent="brand" />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              Success Rate by Queue
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Green = 90%+, yellow = 70–89%, red = below 70%
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: axisColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: axisColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                  labelStyle={{ color: tooltipText, fontWeight: 600, marginBottom: 4 }}
                  itemStyle={{ color: tooltipText }}
                  cursor={{ fill: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
                />
                <Bar dataKey="successRate" radius={[6, 6, 0, 0]} maxBarSize={70}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={rateColor(entry.successRate)} />
                  ))}
                </Bar>
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
                    <td className="px-5 py-3">
                      <span
                        className="font-medium"
                        style={{ color: rateColor(Number(r.successRate)) }}
                      >
                        {r.successRate}%
                      </span>
                    </td>
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