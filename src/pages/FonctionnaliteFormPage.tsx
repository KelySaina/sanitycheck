import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useApplications } from "../hooks/useApplications";
import { useFonctionnalites } from "../hooks/useFonctionnalites";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";

export function FonctionnaliteFormPage() {
  const navigate = useNavigate();
  const { applicationId, id } = useParams<{
    applicationId: string;
    id: string;
  }>();
  const { applications, loading: appsLoading } = useApplications();
  const {
    fonctionnalites,
    createFonctionnalite,
    updateFonctionnalite,
    loading: fonctionnalitesLoading,
  } = useFonctionnalites();
  const [formData, setFormData] = useState({ nom: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!id && id !== "new";

  const application = applications.find((app) => app.id === applicationId);
  const fonctionnalite = fonctionnalites.find((f) => f.id === id);

  useEffect(() => {
    if (isEditing && fonctionnalite) {
      setFormData({
        nom: fonctionnalite.nom,
        description: fonctionnalite.description || "",
      });
    }
  }, [isEditing, fonctionnalite, applications, applicationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim()) {
      setError("Le nom est requis");
      return;
    }
    if (!applicationId) {
      setError("Application non trouvée");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (isEditing && id) {
        await updateFonctionnalite(
          id,
          formData.nom.trim(),
          formData.description.trim() || undefined
        );
      } else {
        await createFonctionnalite(
          formData.nom.trim(),
          applicationId,
          formData.description.trim() || undefined
        );
      }

      navigate(`/applications/${applicationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  if ((appsLoading || fonctionnalitesLoading) && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isEditing && !appsLoading && !fonctionnalite) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          to={`/applications/${applicationId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à l'application
        </Link>
        <ErrorMessage message="Fonctionnalité non trouvée. Vérifiez qu’elle existe et que vous êtes connecté à Supabase." />
      </div>
    );
  }

  if (!application) {
    return <ErrorMessage message="Application non trouvée." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to={`/applications/${applicationId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à {application.nom}
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? "Modifier la fonctionnalité" : "Nouvelle fonctionnalité"}
        </h1>

        {error && <ErrorMessage message={error} className="mb-6" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="nom"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nom de la fonctionnalité *
            </label>
            <input
              type="text"
              id="nom"
              value={formData.nom}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nom: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              to={`/applications/${applicationId}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
