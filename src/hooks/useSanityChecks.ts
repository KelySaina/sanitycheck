import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SanityCheck, SanityCheckWithFonctionnalite } from '../lib/database.types';

export function useSanityChecks(fonctionnaliteId?: string) {
  const [sanityChecks, setSanityChecks] = useState<SanityCheckWithFonctionnalite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSanityChecks();
  }, [fonctionnaliteId]);

  const fetchSanityChecks = async () => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase
        .from('sanity_checks')
        .select(`
          *,
          fonctionnalites (
            *,
            applications (*)
          )
        `)
        .order('date_verification', { ascending: false });

      if (fonctionnaliteId) {
        query = query.eq('fonctionnalite_id', fonctionnaliteId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors du chargement des sanity checks:', error);
        throw error;
      }
      
      setSanityChecks(data || []);
    } catch (err) {
      console.error('Erreur dans fetchSanityChecks:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const createSanityCheck = async (
    fonctionnaliteId: string,
    statut: 'OK' | 'NOT_OK',
    commentaire?: string,
    dateVerification?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('sanity_checks')
        .insert([{
          fonctionnalite_id: fonctionnaliteId,
          statut,
          commentaire,
          date_verification: dateVerification || new Date().toISOString()
        }])
        .select(`
          *,
          fonctionnalites (
            *,
            applications (*)
          )
        `)
        .single();

      if (error) {
        console.error('Erreur lors de la création:', error);
        throw error;
      }
      
      if (data) {
        setSanityChecks(prev => [data, ...prev]);
      }
      return data;
    } catch (err) {
      console.error('Erreur dans createSanityCheck:', err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  };

  const updateSanityCheck = async (
    id: string,
    statut: 'OK' | 'NOT_OK',
    commentaire?: string,
    dateVerification?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('sanity_checks')
        .update({
          statut,
          commentaire,
          date_verification: dateVerification || new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          fonctionnalites (
            *,
            applications (*)
          )
        `)
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        throw error;
      }
      
      if (data) {
        setSanityChecks(prev => prev.map(check => check.id === id ? data : check));
      }
      return data;
    } catch (err) {
      console.error('Erreur dans updateSanityCheck:', err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const deleteSanityCheck = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sanity_checks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        throw error;
      }
      
      setSanityChecks(prev => prev.filter(check => check.id !== id));
    } catch (err) {
      console.error('Erreur dans deleteSanityCheck:', err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  return {
    sanityChecks,
    loading,
    error,
    createSanityCheck,
    updateSanityCheck,
    deleteSanityCheck,
    refetch: fetchSanityChecks
  };
}