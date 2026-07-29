import { useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";

export function useOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosClient.get("/organizations");
      setOrganizations(response.data.organizations || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  async function createOrganization(name, description) {
    const response = await axiosClient.post("/organizations", { name, description });
    setOrganizations((prev) => [response.data.organization, ...prev]);
    return response.data.organization;
  }

  return { organizations, loading, error, createOrganization, refetch: fetchOrganizations };
}