import { useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";

export function useQueues(projectId) {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchQueues = useCallback(async () => {
    if (!projectId) {
      setQueues([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axiosClient.get("/queues", { params: { project_id: projectId } });
      setQueues(response.data.queues || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load queues");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  async function createQueue(payload) {
    const response = await axiosClient.post("/queues", payload);
    setQueues((prev) => [response.data.queue, ...prev]);
    return response.data.queue;
  }

  async function toggleQueueStatus(queueId, newStatus) {
    const response = await axiosClient.patch(`/queues/${queueId}/status`, { status: newStatus });
    setQueues((prev) => prev.map((q) => (q.id === queueId ? response.data.queue : q)));
    return response.data.queue;
  }

  return { queues, loading, error, createQueue, toggleQueueStatus, refetch: fetchQueues };
}