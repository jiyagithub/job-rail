import { useState, useEffect, useCallback, useRef } from "react";
import axiosClient from "../api/axiosClient";

export function useJobs(queueId) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchJobs = useCallback(
    async ({ showLoading } = {}) => {
      if (!queueId) {
        setJobs([]);
        return;
      }
      if (showLoading) setLoading(true);
      setError("");
      try {
        const response = await axiosClient.get("/jobs", { params: { queue_id: queueId } });
        setJobs(response.data.jobs || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load jobs");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [queueId]
  );

  // Initial load — shows the skeleton loader
  useEffect(() => {
    fetchJobs({ showLoading: true });
  }, [fetchJobs]);

  // Background polling — silent, no skeleton flicker, keeps statuses fresh
  useEffect(() => {
    if (!queueId) return;
    const interval = setInterval(() => {
      fetchJobs({ showLoading: false });
    }, 3000);
    return () => clearInterval(interval);
  }, [queueId, fetchJobs]);

  async function createJob(payload) {
    const response = await axiosClient.post("/jobs", payload);
    setJobs((prev) => [response.data.job, ...prev]);
    return response.data.job;
  }

  return { jobs, loading, error, createJob, refetch: fetchJobs };
}