import { useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";

export function useAllQueueAnalytics() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const projectsRes = await axiosClient.get("/projects");
      const projects = projectsRes.data.projects || [];

      const allRows = [];

      for (const project of projects) {
        const queuesRes = await axiosClient.get("/queues", {
          params: { project_id: project.id },
        });
        const queues = queuesRes.data.queues || [];

        for (const queue of queues) {
          try {
            const analyticsRes = await axiosClient.get(`/queues/${queue.id}/analytics`);
            allRows.push({
              queueId: queue.id,
              queueName: queue.name,
              projectName: project.name,
              ...analyticsRes.data.analytics,
            });
          } catch {
            // If one queue's analytics fails, skip it rather than breaking the whole page
          }
        }
      }

      setRows(allRows);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { rows, loading, error, refetch: fetchAll };
}