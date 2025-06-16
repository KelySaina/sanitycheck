import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Application } from "../lib/database.types";

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("nom");

      if (error) {
        console.error("Erreur lors du chargement des applications:", error);
        throw error;
      }

      setApplications(data || []);
    } catch (err) {
      console.error("Erreur dans fetchApplications:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors du chargement"
      );
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (nom: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .insert([{ nom, description }])
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la création:", error);
        throw error;
      }

      if (data) {
        setApplications((prev) => [...prev, data]);
      }
      return data;
    } catch (err) {
      console.error("Erreur dans createApplication:", err);
      throw new Error(
        err instanceof Error ? err.message : "Erreur lors de la création"
      );
    }
  };

  const updateApplication = async (
    id: string,
    nom: string,
    description?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .update({ nom, description })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la mise à jour:", error);
        throw error;
      }

      if (data) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? data : app))
        );
      }
      return data;
    } catch (err) {
      console.error("Erreur dans updateApplication:", err);
      throw new Error(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erreur lors de la suppression:", error);
        throw error;
      }

      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err) {
      console.error("Erreur dans deleteApplication:", err);
      throw new Error(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
    }
  };

  return {
    applications,
    loading,
    error,
    createApplication,
    updateApplication,
    deleteApplication,
    refetch: fetchApplications,
  };
}
