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
    setLoading(true);
    setError("");
    axiosClient
      .get(`/jobs/${jobId}/logs`)
      .then((res) => {
        if (isMounted) setLogs(res.data.logs || []);
      })
      .catch((err) => {
        if (isMounted) setError(err.response?.data?.message || "Failed to load logs");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [jobId]);

  return { logs, loading, error };
}