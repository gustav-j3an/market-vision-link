
import { supabase } from "@/integrations/supabase/client";

export async function uploadVisitaFoto(visitaId: string, file: File, empresaId: string) {
  const fileExt = file.name.split('.').pop();
  const filePath = `${empresaId}/${visitaId}/${Math.random()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('visita-fotos')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('visita-fotos')
    .getPublicUrl(filePath);

  // In the real DB it's caminho_arquivo, but the UI might want the full URL.
  // We'll store the path in caminho_arquivo as per types.ts.
  const { error: dbError } = await supabase
    .from('fotos_visita')
    .insert({
      visita_id: visitaId,
      caminho_arquivo: filePath,
      legenda: null
    });

  if (dbError) throw dbError;

  return urlData.publicUrl;
}

export async function saveVisita(visita: any, itens: any[], fotos: File[], empresaId: string) {
  // 1. Create or update visita
  // Map common fields to DB fields if different
  const visitaToSave = {
    ...visita,
    empresa_id: empresaId,
    inicio: visita.inicio || new Date().toISOString(),
    status: visita.status || 'em_andamento'
  };

  const { data: visitaData, error: visitaError } = await supabase
    .from('visitas')
    .upsert(visitaToSave)
    .select()
    .single();

  if (visitaError) throw visitaError;

  // 2. Save items
  if (itens.length > 0) {
    const itemsToSave = itens.map(item => ({
      ...item,
      visita_id: visitaData.id
    }));

    const { error: itemsError } = await supabase
      .from('itens_visita')
      .upsert(itemsToSave);

    if (itemsError) throw itemsError;
  }

  // 3. Upload photos
  for (const foto of fotos) {
    await uploadVisitaFoto(visitaData.id, foto, empresaId);
  }

  // 4. Update status if finished
  if (visita.fim) {
    if (visita.parada_id) {
      await supabase
        .from('paradas_roteiro')
        .update({ status: 'concluida' })
        .eq('id', visita.parada_id);
    } else if (visita.roteiro_id) {
      await supabase
        .from('roteiros')
        .update({ status: 'concluido' })
        .eq('id', visita.roteiro_id);
    }
  } else {
    if (visita.parada_id) {
      await supabase
        .from('paradas_roteiro')
        .update({ status: 'em_andamento' })
        .eq('id', visita.parada_id);
    } else if (visita.roteiro_id) {
      await supabase
        .from('roteiros')
        .update({ status: 'em_andamento' })
        .eq('id', visita.roteiro_id);
    }
  }

  return visitaData;
}
