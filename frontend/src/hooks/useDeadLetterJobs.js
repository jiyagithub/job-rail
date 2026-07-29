import { useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";

export function useDeadLetterJobs() {
  const [deadLetterJobs, setDeadLetterJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDeadLetterJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosClient.get("/dead-letter-jobs");
      setDeadLetterJobs(response.data.deadLetterJobs || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dead letter jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeadLetterJobs();
  }, [fetchDeadLetterJobs]);

  return { deadLetterJobs, loading, error, refetch: fetchDeadLetterJobs };
}