
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export function usePromotorRoteiros() {
  const { profile } = useAuth();
  const [paradas, setParadas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchParadas() {
      if (!profile?.id) return;

      try {
        setLoading(true);
        
        const { data: promotorData, error: promotorError } = await supabase
          .from('promotores')
          .select('id')
          .eq('perfil_id', profile.id)
          .maybeSingle();

        if (promotorError) throw promotorError;

        if (!promotorData?.id) {
          setParadas([]);
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const promotorId = promotorData.id as string;
        
        const { data, error } = await supabase
          .from('paradas_roteiro')
          .select(`
            *,
            lojas (
              id,
              nome,
              rede,
              endereco,
              cidade
            ),
            industrias (
              id,
              nome,
              marca
            )
          `)
          .eq('promotor_id', promotorId as any)
          .eq('data', today as any)
          .order('ordem', { ascending: true });

        if (error) throw error;
        setParadas(data || []);
      } catch (err: any) {
        console.error("Error fetching promotor paradas:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchParadas();
  }, [profile?.id]);

  return { roteiros: paradas, loading, error };
}
