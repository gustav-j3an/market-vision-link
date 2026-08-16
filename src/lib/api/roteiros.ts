
import { supabase } from "@/integrations/supabase/client";

export type RoteiroStatus = 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';

export interface Roteiro {
  id: string;
  promotor_id: string;
  loja_id: string;
  data_prevista: string;
  horario_previsto: string | null;
  status: string;
  empresa_id: string;
  created_at: string;
  promotor?: {
    id: string;
    perfil: {
      nome: string;
    }
  };
  loja?: {
    id: string;
    nome: string;
    rede: string | null;
  };
}

export async function getRoteiros(empresaId: string) {
  const { data, error } = await supabase
    .from('roteiros')
    .select(`
      *,
      promotores (
        id,
        perfil:profiles (nome)
      ),
      lojas (
        id,
        nome,
        rede
      )
    `)
    .eq('empresa_id', empresaId)
    .order('data_prevista', { ascending: false });

  if (error) throw error;
  
  return data.map(item => ({
    ...item,
    promotor: item.promotores,
    loja: item.lojas
  })) as unknown as Roteiro[];
}

export async function createRoteiro(roteiro: {
  promotor_id: string;
  loja_id: string;
  data_prevista: string;
  horario_previsto: string | null;
  empresa_id: string;
  status?: string;
}) {
  const { data, error } = await supabase
    .from('roteiros')
    .insert(roteiro)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRoteiroStatus(id: string, status: RoteiroStatus) {
  const { error } = await supabase
    .from('roteiros')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteRoteiro(id: string) {
  const { error } = await supabase
    .from('roteiros')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
