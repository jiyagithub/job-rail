import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export function useJobLogs(jobId) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId) {
      setLogs([]);
      return;
    }

    let isMounted = true;

    function fetchLogs(showLoading) {
      if (showLoading) setLoading(true);
      axiosClient
        .get(`/jobs/${jobId}/logs`)
        .then((res) => {
          if (isMounted) setLogs(res.data.logs || []);
        })
        .catch((err) => {
          if (isMounted) setError(err.response?.data?.message || "Failed to load logs");
        })
        .finally(() => {
          if (isMounted && showLoading) setLoading(false);
        });
    }

    fetchLogs(true);
    const interval = setInterval(() => fetchLogs(false), 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [jobId]);

  return { logs, loading, error };
}