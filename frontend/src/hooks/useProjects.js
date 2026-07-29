import { useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosClient.get("/projects");
      setProjects(response.data.projects || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function createProject(name, description, organizationId) {
    const response = await axiosClient.post("/projects", {
      name,
      description,
      organization_id: organizationId,
    });
    setProjects((prev) => [response.data.project, ...prev]);
    return response.data.project;
  }

  return { projects, loading, error, createProject, refetch: fetchProjects };
}