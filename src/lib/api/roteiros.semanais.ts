
import { supabase } from "@/integrations/supabase/client";
import { RoteiroStatus, RoteiroSemanal, ParadaRoteiro } from "./roteiros";

export async function getRoteirosSemanais(empresaId: string, promotorId?: string) {
  let query = supabase
    .from('roteiros_semanais')
    .select(`
      *,
      promotores (
        id,
        perfil:profiles (nome)
      )
    `)
    .eq('empresa_id', empresaId);

  if (promotorId) {
    query = query.eq('promotor_id', promotorId);
  }

  const { data, error } = await query.order('semana_referencia', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getParadasRoteiro(roteiroSemanalId: string) {
  const { data, error } = await supabase
    .from('paradas_roteiro')
    .select(`
      *,
      lojas (id, nome, rede, endereco, cidade, estado),
      industrias (id, nome, marca)
    `)
    .eq('roteiro_semanal_id', roteiroSemanalId)
    .order('dia_semana')
    .order('ordem');

  if (error) throw error;
  return data;
}

export async function createRoteiroSemanal(roteiro: Omit<RoteiroSemanal, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('roteiros_semanais')
    .insert(roteiro)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createParadaRoteiro(parada: Omit<ParadaRoteiro, 'id' | 'created_at' | 'updated_at' | 'loja' | 'industria' | 'promotor'>) {
  const { data, error } = await supabase
    .from('paradas_roteiro')
    .insert(parada as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateParadaStatus(id: string, status: RoteiroStatus) {
  const { error } = await supabase
    .from('paradas_roteiro')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteParada(id: string) {
  const { error } = await supabase
    .from('paradas_roteiro')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
