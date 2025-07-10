import { useEffect, useState } from "react";
import { Filter, Calendar, Trash2, ListChecks } from "lucide-react";
import { useSanityChecks } from "../hooks/useSanityChecks";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { StatusBadge } from "../components/StatusBadge";
import { useRef } from "react";

export function SanityChecksPage() {
  const { sanityChecks, loading, error, deleteSanityCheck } = useSanityChecks();

  const [statusFilter, setStatusFilter] = useState<"ALL" | "OK" | "NOT_OK">(
    "ALL"
  );
  const [appFilter, setAppFilter] = useState<string>("ALL");
  const [fonctionnaliteFilter, setFonctionnaliteFilter] =
    useState<string>("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState(20);

  // Extraire dynamiquement la liste des applications et fonctionnalités uniques
  const uniqueApps = Array.from(
    new Set(
      sanityChecks
        .map((c) => c.fonctionnalites?.applications?.nom)
        .filter(Boolean)
    )
  );

  const fonctionnalitesByApp: Record<string, Set<string>> = {};

  sanityChecks.forEach((check) => {
    const app = check.fonctionnalites?.applications?.nom || "ALL";
    const fn = check.fonctionnalites?.nom;
    if (app && fn) {
      if (!fonctionnalitesByApp[app]) {
        fonctionnalitesByApp[app] = new Set();
      }
      fonctionnalitesByApp[app].add(fn);
    }
  });

  const fonctionnalitesOptions =
    appFilter === "ALL"
      ? Array.from(
          new Set(
            Object.values(fonctionnalitesByApp).flatMap((set) =>
              Array.from(set)
            )
          )
        )
      : Array.from(fonctionnalitesByApp[appFilter] || []);

  // Appliquer les filtres combinés
  const filteredChecks = sanityChecks.filter((check) => {
    const matchDate = (() => {
      const checkDate = new Date(check.date_verification)
        .toISOString()
        .split("T")[0];

      if (startDateFilter && endDateFilter) {
        return checkDate >= startDateFilter && checkDate <= endDateFilter;
      }

      if (dateFilter) {
        return checkDate === dateFilter;
      }

      return true;
    })();

    const matchStatus = statusFilter === "ALL" || check.statut === statusFilter;
    const matchApp =
      appFilter === "ALL" ||
      check.fonctionnalites?.applications?.nom === appFilter;
    const matchFonctionnalite =
      fonctionnaliteFilter === "ALL" ||
      check.fonctionnalites?.nom === fonctionnaliteFilter;

    return matchStatus && matchApp && matchFonctionnalite && matchDate;
  });

  const visibleChecks = filteredChecks.slice(0, visibleCount);

  // In your component:
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const nearBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 100;

      if (nearBottom && visibleCount < filteredChecks.length) {
        setVisibleCount((count) => count + 20);
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [visibleCount, filteredChecks.length]);

  useEffect(() => {
    setFonctionnaliteFilter("ALL");
  }, [appFilter]);

  const resetFilters = () => {
    setStatusFilter("ALL");
    setAppFilter("ALL");
    setFonctionnaliteFilter("ALL");
    setDateFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce sanity check ?")) {
      try {
        setDeletingId(id);
        await deleteSanityCheck(id);
      } catch (err) {
        alert("Erreur lors de la suppression");
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        <ListChecks className="inline-block h-8 w-8 mr-2 text-gray-900" />
        Sanity Checks
      </h1>
      {/* Statistiques */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {sanityChecks.length}
            </div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {sanityChecks.filter((c) => c.statut === "OK").length}
            </div>
            <div className="text-sm text-gray-500">OK</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {sanityChecks.filter((c) => c.statut === "NOT_OK").length}
            </div>
            <div className="text-sm text-gray-500">Problèmes</div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-4 items-end">
        {/* Grille de filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
          {/* Statut */}
          <div>
            <label className="text-sm text-gray-600 flex items-center gap-2 mb-1">
              <Filter className="h-4 w-4 text-gray-500" />
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | "OK" | "NOT_OK")
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="OK">OK uniquement</option>
              <option value="NOT_OK">Problèmes uniquement</option>
            </select>
          </div>

          {/* Application */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Application
            </label>
            <select
              value={appFilter}
              onChange={(e) => setAppFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Toutes</option>
              {uniqueApps.map((app) => (
                <option key={app} value={app}>
                  {app}
                </option>
              ))}
            </select>
          </div>

          {/* Fonctionnalité */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Fonctionnalité
            </label>
            <select
              value={fonctionnaliteFilter}
              onChange={(e) => setFonctionnaliteFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Toutes</option>
              {fonctionnalitesOptions.map((fn) => (
                <option key={fn} value={fn}>
                  {fn}
                </option>
              ))}
            </select>
          </div>

          {/* Date exacte */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              À la date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Entre deux dates */}
          <div className="md:col-span-2 xl:col-span-1">
            <label className="text-sm text-gray-600 mb-1 block">
              Entre deux dates
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">et</span>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bouton Réinitialiser aligné à droite */}
        <div className="ml-auto">
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      {filteredChecks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">
            Aucun sanity check trouvé avec les filtres appliqués.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          <div ref={scrollRef} className="h-[400px] overflow-y-auto">
            <table className="min-w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application / Fonctionnalité
                  </th>
                  <th className="w-1/6 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="w-1/3 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commentaire
                  </th>
                  <th className="w-1/6 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Calendar className="h-4 w-4 mx-auto" />
                  </th>
                  <th className="w-1/12 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visibleChecks.map((check) => (
                  <tr key={check.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {check.fonctionnalites?.nom || "Fonctionnalité supprimée"}
                      <div className="text-sm text-gray-500">
                        {check.fonctionnalites?.applications?.nom ||
                          "Application supprimée"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={check.statut} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      {check.commentaire || "-"}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                      <div>
                        {new Date(check.date_verification).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                      <div className="text-xs">
                        {new Date(check.date_verification).toLocaleTimeString(
                          "fr-FR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(check.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        disabled={deletingId === check.id}
                        title="Supprimer"
                      >
                        {deletingId === check.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
