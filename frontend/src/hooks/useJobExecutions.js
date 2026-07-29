import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export function useJobExecutions(jobId) {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId) {
      setExecutions([]);
      return;
    }
    let isMounted = true;
    setLoading(true);
    setError("");
    axiosClient
      .get(`/jobs/${jobId}/executions`)
      .then((res) => {
        if (isMounted) setExecutions(res.data.executions || []);
      })
      .catch((err) => {
        if (isMounted) setError(err.response?.data?.message || "Failed to load executions");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [jobId]);

  return { executions, loading, error };
}