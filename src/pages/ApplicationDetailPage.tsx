import { useState } from "react";
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
  const today = new Date().toISOString().split("T")[0];
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
  const [comment, setComment] = useState<string>("PROD -Thierry");
  const [commentStatus, setCommentStatus] = useState<"OK" | "NOT_OK" | null>(
    null
  );

  const startSanityCheck = (
    fonctId: string,
    statut: "OK" | "NOT_OK",
    env: "PROD" | "PREPROD"
  ) => {
    setCommentFonctId(fonctId);
    setCommentStatus(statut);
    setComment(`${env.toUpperCase()} - Thierry`);
  };

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
      setComment("PROD -Thierry");
      setCommentStatus(null);
    }
  };

  // Nouvelle fonction qui retourne les derniers checks prod et preprod du jour pour une fonctionnalité
  const getTodayChecksByEnv = (fonctId: string) => {
    const checksForFonct = sanityChecks.filter(
      (check) =>
        check.fonctionnalite_id === fonctId &&
        new Date(check.date_verification).toISOString().split("T")[0] === today
    );

    // Séparer prod et preprod d'après commentaire
    const prodChecks = checksForFonct
      .filter((c) => c.commentaire?.toLowerCase().startsWith("prod"))
      .sort(
        (a, b) =>
          new Date(b.date_verification).getTime() -
          new Date(a.date_verification).getTime()
      );

    const preprodChecks = checksForFonct
      .filter((c) => c.commentaire?.toLowerCase().startsWith("preprod"))
      .sort(
        (a, b) =>
          new Date(b.date_verification).getTime() -
          new Date(a.date_verification).getTime()
      );

    return {
      prod: prodChecks[0],
      preprod: preprodChecks[0],
    };
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
                    Dernier Check PROD
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernier Check PREPROD
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
                {fonctionnalites
                  .filter((fonct) => fonct.nom.includes("TNR"))
                  .map((fonct) => {
                    const { prod, preprod } = getTodayChecksByEnv(fonct.id);

                    const renderStatus = (
                      check: typeof preprod | undefined,
                      env: string
                    ) => {
                      const isPreprod = env.toLowerCase().includes("preprod");

                      if (!check) {
                        // Non vérifié aujourd’hui pour cet environnement
                        return (
                          // <span
                          //   key={env}
                          //   className={`inline-block w-3 h-3 rounded-full mx-1 ${
                          //     isPreprod ? "bg-orange-400" : "bg-blue-400"
                          //   }`}
                          //   title={`Non vérifié aujourd’hui (${env})`}
                          // />
                          <span>-</span>
                        );
                      }

                      return (
                        <div
                          key={env}
                          className="inline-flex flex-col items-center mx-2"
                          title={`${check.statut} (${env}) - ${new Date(
                            check.date_verification
                          ).toLocaleTimeString("fr-FR")}`}
                        >
                          <StatusBadge
                            status={check.statut}
                            size="sm"
                            className={
                              isPreprod ? "bg-orange-400" : "bg-blue-400"
                            }
                          />
                          <span className="text-xs text-gray-500">
                            {new Date(
                              check.date_verification
                            ).toLocaleTimeString("fr-FR")}
                          </span>
                        </div>
                      );
                    };

                    return (
                      <tr key={fonct.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                            {!prod ? (
                              <span
                                className="w-2.5 h-2.5 rounded-full bg-blue-400"
                                title="Non vérifié aujourd’hui en PROD"
                              />
                            ) : null}
                            {!preprod ? (
                              <span
                                className="w-2.5 h-2.5 rounded-full bg-orange-400"
                                title="Non vérifié aujourd’hui en PREPROD"
                              />
                            ) : null}
                            <span>{fonct.nom}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {fonct.description || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {renderStatus(prod, "PROD")}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {renderStatus(preprod, "PREPROD")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {commentFonctId === fonct.id ? (
                            <div>
                              <div className="text-sm text-center font-medium text-gray-800">
                                Commentaire pour {comment.split(" - ")[0]}{" "}
                                {commentStatus}
                              </div>
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
                                      setComment("PROD - Thierry");
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
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {/* Boutons PROD */}
                              <button
                                onClick={() =>
                                  startSanityCheck(fonct.id, "OK", "PROD")
                                }
                                disabled={addingCheckId === fonct.id}
                                className="inline-flex items-center justify-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 transition-colors break-words whitespace-normal text-center w-full"
                              >
                                {/* <CheckCircle className="h-3 w-3 mr-1" /> */}
                                PROD OK
                              </button>
                              <button
                                onClick={() =>
                                  startSanityCheck(fonct.id, "NOT_OK", "PROD")
                                }
                                disabled={addingCheckId === fonct.id}
                                className="inline-flex items-center justify-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200 transition-colors break-words whitespace-normal text-center w-full"
                              >
                                {/* <XCircle className="h-3 w-3 mr-1" /> */}
                                PROD NOT OK
                              </button>

                              {/* Boutons PREPROD */}
                              <button
                                onClick={() =>
                                  startSanityCheck(fonct.id, "OK", "PREPROD")
                                }
                                disabled={addingCheckId === fonct.id}
                                className="inline-flex items-center justify-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 transition-colors break-words whitespace-normal text-center w-full"
                              >
                                {/* <CheckCircle className="h-3 w-3 mr-1" /> */}
                                PREPROD OK
                              </button>
                              <button
                                onClick={() =>
                                  startSanityCheck(
                                    fonct.id,
                                    "NOT_OK",
                                    "PREPROD"
                                  )
                                }
                                disabled={addingCheckId === fonct.id}
                                className="inline-flex items-center justify-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200 transition-colors break-words whitespace-normal text-center w-full"
                              >
                                {/* <XCircle className="h-3 w-3 mr-1" /> */}
                                PREPROD NOT OK
                              </button>
                            </div>
                          )}

                          {/* <div className="flex flex-wrap justify-center gap-2">
                          <button
                            onClick={() =>
                              startSanityCheck(fonct.id, "OK", "PROD")
                            }
                            disabled={addingCheckId === fonct.id}
                            className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            PROD OK
                          </button>
                          <button
                            onClick={() =>
                              startSanityCheck(fonct.id, "NOT_OK", "PROD")
                            }
                            disabled={addingCheckId === fonct.id}
                            className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200 transition-colors"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            PROD NOT OK
                          </button>

                          <button
                            onClick={() =>
                              startSanityCheck(fonct.id, "OK", "PREPROD")
                            }
                            disabled={addingCheckId === fonct.id}
                            className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            PREPROD OK
                          </button>
                          <button
                            onClick={() =>
                              startSanityCheck(fonct.id, "NOT_OK", "PREPROD")
                            }
                            disabled={addingCheckId === fonct.id}
                            className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200 transition-colors"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            PREPROD NOT OK
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
                                  setComment("PROD - Thierry");
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
                        )} */}
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
