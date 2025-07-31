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

  const today = new Date().toISOString().split("T")[0];

  // 1. Trouver le dernier check PAR fonctionnalite ET PAR env (prod/preprod) pour aujourd'hui
  type CheckType = (typeof sanityChecks)[number];
  const latestCheckByFuncEnv: Record<
    string,
    { prod?: CheckType; preprod?: CheckType }
  > = {};

  const sortedChecks = [...sanityChecks].sort(
    (a, b) =>
      new Date(b.date_verification).getTime() -
      new Date(a.date_verification).getTime()
  );

  for (const check of sortedChecks) {
    const checkDate = new Date(check.date_verification)
      .toISOString()
      .split("T")[0];
    if (checkDate !== today) continue;

    const funcId = check.fonctionnalite_id;
    const comment = (check.commentaire ?? "").toLowerCase();
    const env = comment.includes("preprod")
      ? "preprod"
      : comment.includes("prod")
      ? "prod"
      : null;
    if (!env) continue;

    if (!latestCheckByFuncEnv[funcId]) {
      latestCheckByFuncEnv[funcId] = {};
    }

    // Stocker seulement si pas déjà stocké (on part du plus récent donc le premier est le plus récent)
    if (!latestCheckByFuncEnv[funcId][env]) {
      latestCheckByFuncEnv[funcId][env] = check;
    }
  }

  // 2. Compter OK / NOT_OK globalement sur tous les derniers checks par fonctionnalité et env
  let okCount = 0;
  let notOkCount = 0;

  for (const funcId in latestCheckByFuncEnv) {
    const envChecks = latestCheckByFuncEnv[funcId];
    ["prod", "preprod"].forEach((env) => {
      const check = envChecks[env as "prod" | "preprod"];
      if (!check) return;

      if (check.statut.trim().toUpperCase() === "OK") okCount++;
      else if (check.statut.trim().toUpperCase() === "NOT_OK") notOkCount++;
    });
  }

  // 3. Préparer recentChecks pour l'affichage (tableau), on aplatie et on trie par date
  const recentChecks = Object.entries(latestCheckByFuncEnv)
    .flatMap(([_, envChecks]) =>
      Object.values(envChecks).filter((c): c is CheckType => !!c)
    )
    .sort(
      (a, b) =>
        new Date(b.date_verification).getTime() -
        new Date(a.date_verification).getTime()
    );

  // 4. Construire map fonctionnalites par application pour affichage détaillé
  const fonctionnalitesParApp: Record<string, typeof fonctionnalites> =
    fonctionnalites
      .filter((fonct) => fonct.nom.includes("TNR"))
      .reduce((acc, f) => {
        const appId = f.application_id;
        if (!acc[appId]) acc[appId] = [];
        acc[appId].push(f);
        return acc;
      }, {} as Record<string, typeof fonctionnalites>);

  if (loadingApps || loadingFonctionnalites || loadingChecks) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (errorApps) {
    return <ErrorMessage message={errorApps} />;
  }

  return (
    <div className="space-y-8">
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
          <div className="grid grid-cols-1 gap-6">
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
                Fonctionnalités
              </h3>
              <p className="text-3xl font-bold text-indigo-600">
                {fonctionnalites.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sanity Checks d'aujourd'hui
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
                {applications.map((app) => {
                  const fonctionApp = fonctionnalitesParApp[app.id] ?? [];

                  // compter OK, NOT_OK, NON_VERIFIE par env pour les fonctionnalités de l'app
                  const countsByEnv = {
                    prod: { OK: 0, NOT_OK: 0, NON_VERIFIE: 0 },
                    preprod: { OK: 0, NOT_OK: 0, NON_VERIFIE: 0 },
                  };

                  fonctionApp.forEach((func) => {
                    const checksForFunc = latestCheckByFuncEnv[func.id] ?? {};

                    ["prod", "preprod"].forEach((env) => {
                      const check = checksForFunc[env as "prod" | "preprod"];
                      if (!check) {
                        countsByEnv[env].NON_VERIFIE++;
                      } else {
                        if (check.statut.trim().toUpperCase() === "OK")
                          countsByEnv[env].OK++;
                        else if (check.statut.trim().toUpperCase() === "NOT_OK")
                          countsByEnv[env].NOT_OK++;
                        else countsByEnv[env].NON_VERIFIE++; // fallback
                      }
                    });
                  });

                  const getPieData = (env: "prod" | "preprod") => [
                    {
                      name: "OK",
                      value: countsByEnv[env].OK,
                      color: "#16a34a",
                    },
                    {
                      name: "NOT_OK",
                      value: countsByEnv[env].NOT_OK,
                      color: "#dc2626",
                    },
                    {
                      name: "Non vérifié",
                      value: countsByEnv[env].NON_VERIFIE,
                      color: "#f97316",
                    },
                  ];

                  return (
                    <div
                      key={app.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {app.nom}
                      </h3>
                      {app.description && (
                        <p className="text-gray-600 text-sm mb-4">
                          {app.description}
                        </p>
                      )}

                      <div className="flex flex-col items-center gap-4">
                        {["prod", "preprod"].map((env) => (
                          <div key={env} className="w-1/2">
                            <h4 className="text-sm font-medium text-center text-gray-700 mb-2 uppercase">
                              {env}
                            </h4>
                            <ResponsiveContainer width="100%" height={180}>
                              <PieChart>
                                <Pie
                                  data={getPieData(env)}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={50}
                                  label
                                >
                                  {getPieData(env).map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        ))}
                      </div>

                      <Link
                        to={`/applications/${app.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mt-4"
                      >
                        Voir les fonctionnalités
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  );
                })}
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
              Sanity Checks d'aujourd'hui
            </h2>
          </div>
          <div className="p-6">
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
