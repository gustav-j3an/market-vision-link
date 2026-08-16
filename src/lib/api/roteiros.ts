
import { supabase } from "@/integrations/supabase/client";

export type RoteiroStatus = 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';

export interface RoteiroSemanal {
  id: string;
  promotor_id: string;
  semana_referencia: string;
  nome: string | null;
  status: string;
  empresa_id: string;
  created_at: string;
}

export interface ParadaRoteiro {
  id: string;
  roteiro_semanal_id: string;
  dia_semana: number;
  data: string;
  promotor_id: string;
  loja_id: string;
  industria_id: string;
  horario_previsto: string | null;
  ordem: number;
  status: RoteiroStatus;
  observacao: string | null;
  loja?: {
    id: string;
    nome: string;
    rede: string | null;
    endereco: string | null;
    cidade: string | null;
    estado: string | null;
  };
  industria?: {
    id: string;
    nome: string;
    marca: string | null;
  };
  promotor?: {
    id: string;
    perfil: {
      nome: string;
    }
  };
}

// Keeping old interface for compatibility during migration
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
  status?: RoteiroStatus;
}) {
  // Check for duplicates
  const { data: existing, error: checkError } = await supabase
    .from('roteiros')
    .select('id')
    .eq('promotor_id', roteiro.promotor_id)
    .eq('loja_id', roteiro.loja_id)
    .eq('data_prevista', roteiro.data_prevista)
    .eq('horario_previsto', roteiro.horario_previsto as any)
    .maybeSingle();

  if (checkError) throw checkError;
  if (existing) throw new Error("Já existe um roteiro para este promotor nesta loja, data e horário.");

  const { data, error } = await supabase
    .from('roteiros')
    .insert({
      ...roteiro,
      status: roteiro.status || 'pendente'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRoteiro(id: string, roteiro: Partial<{
  promotor_id: string;
  loja_id: string;
  data_prevista: string;
  horario_previsto: string | null;
  status?: RoteiroStatus;
}>) {
  const { data, error } = await supabase
    .from('roteiros')
    .update(roteiro)
    .eq('id', id)
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
