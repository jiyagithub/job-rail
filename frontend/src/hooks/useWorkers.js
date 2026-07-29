import { useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";

export function useWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWorkers = useCallback(async () => {
    try {
      const response = await axiosClient.get("/workers");
      setWorkers(response.data.workers || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load workers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers(); // initial load
    const interval = setInterval(fetchWorkers, 5000); // refresh every 5s to keep heartbeat accurate
    return () => clearInterval(interval);
  }, [fetchWorkers]);

  return { workers, loading, error };
}