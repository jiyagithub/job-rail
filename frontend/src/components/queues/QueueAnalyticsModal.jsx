import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import Modal from "../ui/Modal";
import Skeleton from "../ui/Skeleton";

function QueueAnalyticsModal({ queueId, queueName, onClose }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!queueId) return;
    let isMounted = true;
    setLoading(true);
    setError("");
    axiosClient
      .get(`/queues/${queueId}/analytics`)
      .then((res) => {
        if (isMounted) setAnalytics(res.data.analytics);
      })
      .catch((err) => {
        if (isMounted) setError(err.response?.data?.message || "Failed to load analytics");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [queueId]);

  return (
    <Modal open={!!queueId} onClose={onClose} title={`Analytics — ${queueName}`}>
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-gray-400">Total Jobs</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{analytics.totalJobs}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-gray-400">Success Rate</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{analytics.successRate}%</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-gray-400">Completed</p>
            <p className="text-lg font-semibold text-green-600">{analytics.completedJobs}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-gray-400">Failed</p>
            <p className="text-lg font-semibold text-red-600">{analytics.failedJobs}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-gray-400">Pending</p>
            <p className="text-lg font-semibold text-yellow-600">{analytics.pendingJobs}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-gray-400">Running</p>
            <p className="text-lg font-semibold text-blue-600">{analytics.runningJobs}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-gray-400">Total Retries</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{analytics.totalRetries}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-gray-400">Avg Execution</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {analytics.averageExecutionSeconds}s
            </p>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export default QueueAnalyticsModal;