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

    function fetchExecutions(showLoading) {
      if (showLoading) setLoading(true);
      axiosClient
        .get(`/jobs/${jobId}/executions`)
        .then((res) => {
          if (isMounted) setExecutions(res.data.executions || []);
        })
        .catch((err) => {
          if (isMounted) setError(err.response?.data?.message || "Failed to load executions");
        })
        .finally(() => {
          if (isMounted && showLoading) setLoading(false);
        });
    }

    fetchExecutions(true);
    const interval = setInterval(() => fetchExecutions(false), 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [jobId]);

  return { executions, loading, error };
}