import { useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";

export function useJobs(queueId) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchJobs = useCallback(async () => {
    if (!queueId) {
      setJobs([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axiosClient.get("/jobs", { params: { queue_id: queueId } });
      setJobs(response.data.jobs || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [queueId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  async function createJob(payload) {
    const response = await axiosClient.post("/jobs", payload);
    setJobs((prev) => [response.data.job, ...prev]);
    return response.data.job;
  }

  return { jobs, loading, error, createJob, refetch: fetchJobs };
}