import React, { useState } from 'react';
import { Filter, Calendar, Trash2 } from 'lucide-react';
import { useSanityChecks } from '../hooks/useSanityChecks';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { StatusBadge } from '../components/StatusBadge';

export function SanityChecksPage() {
  const { sanityChecks, loading, error, deleteSanityCheck } = useSanityChecks();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OK' | 'NOT_OK'>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredChecks = sanityChecks.filter(check => {
    if (statusFilter === 'ALL') return true;
    return check.statut === statusFilter;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce sanity check ?')) {
      try {
        setDeletingId(id);
        await deleteSanityCheck(id);
      } catch (err) {
        alert('Erreur lors de la suppression');
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Sanity Checks</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'OK' | 'NOT_OK')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="OK">OK uniquement</option>
              <option value="NOT_OK">Problèmes uniquement</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{sanityChecks.length}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {sanityChecks.filter(c => c.statut === 'OK').length}
            </div>
            <div className="text-sm text-gray-500">OK</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {sanityChecks.filter(c => c.statut === 'NOT_OK').length}
            </div>
            <div className="text-sm text-gray-500">Problèmes</div>
          </div>
        </div>
      </div>

      {filteredChecks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">
            {statusFilter === 'ALL' 
              ? 'Aucun sanity check enregistré' 
              : `Aucun sanity check avec le statut ${statusFilter === 'OK' ? 'OK' : 'NOT OK'}`
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application / Fonctionnalité
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commentaire
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Calendar className="h-4 w-4 mx-auto" />
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChecks.map((check) => (
                  <tr key={check.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {check.fonctionnalites?.nom || 'Fonctionnalité supprimée'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {check.fonctionnalites?.applications?.nom || 'Application supprimée'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <StatusBadge status={check.statut} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {check.commentaire || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      <div>
                        {new Date(check.date_verification).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-xs">
                        {new Date(check.date_verification).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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