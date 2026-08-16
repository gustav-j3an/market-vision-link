
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Roteiro } from '@/lib/api/roteiros';

export function usePromotorRoteiros() {
  const { user, profile } = useAuth();
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchRoteiros() {
      if (!profile?.id) return;

      try {
        setLoading(true);
        
        // Find the promotor record for this profile
        const { data: promotorData, error: promotorError } = await supabase
          .from('promotores')
          .select('id')
          .eq('perfil_id', profile.id)
          .maybeSingle();

        if (promotorError) throw promotorError;

        if (!promotorData?.id) {
          setRoteiros([]);
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const promotorId: string = promotorData.id;
        
        const { data, error } = await supabase
          .from('roteiros')
          .select(`
            *,
            lojas (
              id,
              nome,
              rede,
              endereco,
              cidade
            )
          `)
          .eq('promotor_id', promotorId)
          .eq('data_prevista', today)
          .order('horario_previsto', { ascending: true });

        if (error) throw error;
        
        setRoteiros((data || []).map(r => ({
          ...r,
          loja: (r as any).lojas
        })) as unknown as Roteiro[]);
      } catch (err: any) {
        console.error("Error fetching promotor roteiros:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoteiros();
  }, [profile?.id]);

  return { roteiros, loading, error };
}
