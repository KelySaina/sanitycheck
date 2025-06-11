import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useApplications } from '../hooks/useApplications';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export function ApplicationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { applications, createApplication, updateApplication, loading } = useApplications();
  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = id && id !== 'new';
  const application = isEditing ? applications.find(app => app.id === id) : null;

  useEffect(() => {
    if (isEditing && application) {
      setFormData({
        nom: application.nom,
        description: application.description || ''
      });
    }
  }, [isEditing, application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim()) {
      setError('Le nom est requis');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (isEditing && id) {
        await updateApplication(id, formData.nom.trim(), formData.description.trim() || undefined);
      } else {
        await createApplication(formData.nom.trim(), formData.description.trim() || undefined);
      }

      navigate('/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  // Afficher le spinner seulement si on charge les applications ET qu'on est en mode édition
  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Afficher l'erreur seulement si on est en mode édition et que l'application n'existe pas
  if (isEditing && !loading && !application) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/applications"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux applications
          </Link>
        </div>
        <ErrorMessage message="Application non trouvée. Vérifiez que l'application existe et que vous êtes connecté à Supabase." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/applications"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux applications
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Modifier l\'application' : 'Nouvelle application'}
        </h1>

        {error && (
          <ErrorMessage message={error} className="mb-6" />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'application *
            </label>
            <input
              type="text"
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Système de gestion..."
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description de l'application..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              to="/applications"
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
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}