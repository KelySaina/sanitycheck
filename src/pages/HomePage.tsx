import { Link } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import { useApplications } from "../hooks/useApplications";
import { useSanityChecks } from "../hooks/useSanityChecks";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { StatusBadge } from "../components/StatusBadge";
import { useFonctionnalites } from "../hooks/useFonctionnalites";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export function HomePage() {
  const {
    applications,
    loading: loadingApps,
    error: errorApps,
  } = useApplications();
  const { sanityChecks, loading: loadingChecks } = useSanityChecks();
  const { fonctionnalites, loading: loadingFonctionnalites } =
    useFonctionnalites();

  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

  const todaysChecksByFunctionality = sanityChecks.reduce((acc, check) => {
    const checkDate = new Date(check.date_verification)
      .toISOString()
      .split("T")[0];
    if (checkDate === today) {
      const funcId = check.fonctionnalites.id;
      acc[funcId] = check;
    }
    return acc;
  }, {} as Record<string, (typeof sanityChecks)[number]>);

  if (loadingApps) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loadingFonctionnalites) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (errorApps) {
    return <ErrorMessage message={errorApps} />;
  }

  // Calculer les statistiques des sanity checks récents
  const recentChecks = sanityChecks.slice(0, 10);
  const okCount = recentChecks.filter((check) => check.statut === "OK").length;
  const notOkCount = recentChecks.filter(
    (check) => check.statut === "NOT_OK"
  ).length;

  const fonctionnalitesParApp: Record<string, typeof fonctionnalites> =
    fonctionnalites.reduce((acc, f) => {
      const appId = f.application_id;
      if (!acc[appId]) acc[appId] = [];
      acc[appId].push(f);
      return acc;
    }, {} as Record<string, typeof fonctionnalites>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Tableau de bord SanityTracker
        </h1>
        <p className="text-xl text-gray-600">
          Surveillez l'état de santé de vos applications métiers
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Statistiques */}
        <div className="md:w-1/3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Applications
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {applications.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Checks récents
              </h3>
              <p className="text-3xl font-bold text-gray-600">
                {recentChecks.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Statut OK
              </h3>
              <p className="text-3xl font-bold text-green-600">{okCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Problèmes
              </h3>
              <p className="text-3xl font-bold text-red-600">{notOkCount}</p>
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="md:w-2/3 bg-white rounded-lg shadow-md flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Applications
            </h2>
            <Link
              to="/applications/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle application
            </Link>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
              <span>OK</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
              <span>Problème</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
              <span>Non vérifiée</span>
            </div>
          </div>
          <div className="p-6 overflow-auto">
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Aucune application enregistrée
                </p>
                <Link
                  to="/applications/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer votre première application
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {app.nom}
                    </h3>
                    {app.description && (
                      <p className="text-gray-600 text-sm mb-2">
                        {app.description}
                      </p>
                    )}

                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={(() => {
                            const fonctionApp =
                              fonctionnalitesParApp[app.id] ?? [];

                            const counts = {
                              OK: 0,
                              NOT_OK: 0,
                              NON_VERIFIE: 0,
                            };

                            fonctionApp.forEach((func) => {
                              const check =
                                todaysChecksByFunctionality[func.id];
                              if (!check) {
                                counts.NON_VERIFIE++;
                              } else if (check.statut === "OK") {
                                counts.OK++;
                              } else if (check.statut === "NOT_OK") {
                                counts.NOT_OK++;
                              }
                            });

                            return [
                              { name: "OK", value: counts.OK },
                              { name: "NOT_OK", value: counts.NOT_OK },
                              {
                                name: "Non vérifié",
                                value: counts.NON_VERIFIE,
                              },
                            ];
                          })()}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={50}
                          label
                        >
                          <Cell key="ok" fill="#16a34a" />
                          <Cell key="not-ok" fill="#dc2626" />
                          <Cell key="non-verifie" fill="#f97316" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    <Link
                      to={`/applications/${app.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Voir les fonctionnalités
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sanity Checks récents */}
      {recentChecks.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Sanity Checks récents
            </h2>
          </div>
          <div className="p-6">
            {/* Conteneur scrollable */}
            <div className="max-h-96 overflow-y-auto space-y-4">
              {recentChecks.map((check) => (
                <div
                  key={check.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {check.fonctionnalites.nom}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {check.fonctionnalites.applications.nom}
                    </p>
                    {check.commentaire && (
                      <p className="text-sm text-gray-500 mt-1">
                        {check.commentaire}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <StatusBadge status={check.statut} />
                    <span className="text-sm text-gray-500">
                      {new Date(check.date_verification).toLocaleDateString(
                        "fr-FR"
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
