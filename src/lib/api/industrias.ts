
import { supabase } from "@/integrations/supabase/client";

export interface Industria {
  id: string;
  nome: string;
  marca: string | null;
  categoria: string | null;
  status: 'ativo' | 'inativo';
  contato: string | null;
  empresa_id: string;
}

export async function getIndustrias(empresaId: string) {
  const { data, error } = await supabase
    .from('industrias')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('nome');

  if (error) throw error;
  return data as Industria[];
}

export async function createIndustria(industria: Omit<Industria, 'id'>) {
  const { data, error } = await supabase
    .from('industrias')
    .insert(industria)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateIndustria(id: string, industria: Partial<Industria>) {
  const { data, error } = await supabase
    .from('industrias')
    .update(industria)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
