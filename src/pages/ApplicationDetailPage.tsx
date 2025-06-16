import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useApplications } from "../hooks/useApplications";
import { useFonctionnalites } from "../hooks/useFonctionnalites";
import { useSanityChecks } from "../hooks/useSanityChecks";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { StatusBadge } from "../components/StatusBadge";

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { applications, loading: loadingApp } = useApplications();
  const {
    fonctionnalites,
    loading: loadingFonct,
    deleteFonctionnalite,
  } = useFonctionnalites(id);
  const { sanityChecks, createSanityCheck } = useSanityChecks();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingCheckId, setAddingCheckId] = useState<string | null>(null);

  const [commentFonctId, setCommentFonctId] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
  const [commentStatus, setCommentStatus] = useState<"OK" | "NOT_OK" | null>(
    null
  );

  const application = applications.find((app) => app.id === id);

  const handleDeleteFonctionnalite = async (fonctId: string, nom: string) => {
    if (
      confirm(`Êtes-vous sûr de vouloir supprimer la fonctionnalité "${nom}" ?`)
    ) {
      try {
        setDeletingId(fonctId);
        await deleteFonctionnalite(fonctId);
      } catch (err) {
        alert("Erreur lors de la suppression");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleQuickSanityCheck = async (
    fonctId: string,
    statut: "OK" | "NOT_OK",
    commentaire?: string
  ) => {
    try {
      setAddingCheckId(fonctId);
      await createSanityCheck(fonctId, statut, commentaire);
    } catch (err) {
      alert("Erreur lors de l'ajout du sanity check");
    } finally {
      setAddingCheckId(null);
      setCommentFonctId(null);
      setComment("");
      setCommentStatus(null);
    }
  };

  const getLatestCheck = (fonctId: string) => {
    return sanityChecks
      .filter((check) => check.fonctionnalite_id === fonctId)
      .sort(
        (a, b) =>
          new Date(b.date_verification).getTime() -
          new Date(a.date_verification).getTime()
      )[0];
  };

  if (loadingApp || loadingFonct) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {application.nom}
            </h1>
            {application.description && (
              <p className="text-gray-600">{application.description}</p>
            )}
          </div>
          <Link
            to={`/applications/${id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Fonctionnalités
          </h2>
          <Link
            to={`/applications/${id}/fonctionnalites/new`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle fonctionnalité
          </Link>
        </div>

        {fonctionnalites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Aucune fonctionnalité enregistrée
            </p>
            <Link
              to={`/applications/${id}/fonctionnalites/new`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une fonctionnalité
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernier Check
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions Rapides
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fonctionnalites.map((fonct) => {
                  const latestCheck = getLatestCheck(fonct.id);
                  return (
                    <tr key={fonct.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {fonct.nom}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {fonct.description || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {latestCheck ? (
                          <div className="space-y-1">
                            <StatusBadge
                              status={latestCheck.statut}
                              size="sm"
                            />
                            <div className="text-xs text-gray-500">
                              {new Date(
                                latestCheck.date_verification
                              ).toLocaleDateString("fr-FR")}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Aucun check
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => {
                              setCommentFonctId(fonct.id);
                              setCommentStatus("OK");
                            }}
                            disabled={addingCheckId === fonct.id}
                            className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 transition-colors"
                          >
                            {addingCheckId === fonct.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                OK
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setCommentFonctId(fonct.id);
                              setCommentStatus("NOT_OK");
                            }}
                            disabled={addingCheckId === fonct.id}
                            className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200 transition-colors"
                          >
                            {addingCheckId === fonct.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                NOT OK
                              </>
                            )}
                          </button>
                        </div>
                        {commentFonctId === fonct.id && (
                          <div className="mt-2 text-left">
                            <textarea
                              rows={2}
                              className="w-full text-sm px-2 py-1 border border-gray-300 rounded-md"
                              placeholder="Commentaire (optionnel)"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                              <button
                                className="text-gray-500 hover:text-gray-700 text-sm"
                                onClick={() => {
                                  setCommentFonctId(null);
                                  setComment("");
                                }}
                              >
                                Annuler
                              </button>
                              <button
                                className="text-blue-600 hover:text-blue-800 text-sm"
                                onClick={() =>
                                  handleQuickSanityCheck(
                                    fonct.id,
                                    commentStatus!,
                                    comment
                                  )
                                }
                                disabled={addingCheckId === fonct.id}
                              >
                                {addingCheckId === fonct.id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  "Valider"
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/fonctionnalites/${application.id}/${fonct.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() =>
                              handleDeleteFonctionnalite(fonct.id, fonct.nom)
                            }
                            className="text-red-600 hover:text-red-900 p-1"
                            disabled={deletingId === fonct.id}
                            title="Supprimer"
                          >
                            {deletingId === fonct.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
