import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Fonctionnalite, FonctionnaliteWithApplication } from '../lib/database.types';

export function useFonctionnalites(applicationId?: string) {
  const [fonctionnalites, setFonctionnalites] = useState<FonctionnaliteWithApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFonctionnalites();
  }, [applicationId]);

  const fetchFonctionnalites = async () => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase
        .from('fonctionnalites')
        .select(`
          *,
          applications (*)
        `)
        .order('nom');

      if (applicationId) {
        query = query.eq('application_id', applicationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors du chargement des fonctionnalités:', error);
        throw error;
      }
      
      setFonctionnalites(data || []);
    } catch (err) {
      console.error('Erreur dans fetchFonctionnalites:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const createFonctionnalite = async (nom: string, applicationId: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('fonctionnalites')
        .insert([{ nom, application_id: applicationId, description }])
        .select(`
          *,
          applications (*)
        `)
        .single();

      if (error) {
        console.error('Erreur lors de la création:', error);
        throw error;
      }
      
      if (data) {
        setFonctionnalites(prev => [...prev, data]);
      }
      return data;
    } catch (err) {
      console.error('Erreur dans createFonctionnalite:', err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  };

  const updateFonctionnalite = async (id: string, nom: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('fonctionnalites')
        .update({ nom, description })
        .eq('id', id)
        .select(`
          *,
          applications (*)
        `)
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        throw error;
      }
      
      if (data) {
        setFonctionnalites(prev => prev.map(func => func.id === id ? data : func));
      }
      return data;
    } catch (err) {
      console.error('Erreur dans updateFonctionnalite:', err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const deleteFonctionnalite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fonctionnalites')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        throw error;
      }
      
      setFonctionnalites(prev => prev.filter(func => func.id !== id));
    } catch (err) {
      console.error('Erreur dans deleteFonctionnalite:', err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  return {
    fonctionnalites,
    loading,
    error,
    createFonctionnalite,
    updateFonctionnalite,
    deleteFonctionnalite,
    refetch: fetchFonctionnalites
  };
}