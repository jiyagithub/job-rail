import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      setLoading(true);
      setError("");
      try {
        const response = await axiosClient.get("/dashboard/stats");
        if (isMounted) {
          setStats(response.data.stats);
          setRecentJobs(response.data.recentJobs || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load dashboard");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return { stats, recentJobs, loading, error };
}