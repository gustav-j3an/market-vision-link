
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

  const { error: dbError } = await supabase
    .from('fotos_visita')
    .insert({
      visita_id: visitaId,
      foto_url: urlData.publicUrl,
      empresa_id: empresaId
    });

  if (dbError) throw dbError;

  return urlData.publicUrl;
}

export async function saveVisita(visita: any, itens: any[], fotos: File[], empresaId: string) {
  // 1. Create or update visita
  const { data: visitaData, error: visitaError } = await supabase
    .from('visitas')
    .upsert({
      ...visita,
      empresa_id: empresaId,
      data_visita: new Date().toISOString().split('T')[0]
    })
    .select()
    .single();

  if (visitaError) throw visitaError;

  // 2. Save items
  if (itens.length > 0) {
    const itemsToSave = itens.map(item => ({
      ...item,
      visita_id: visitaData.id,
      empresa_id: empresaId
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

  // 4. Update roteiro status if finished
  if (visita.hora_fim) {
    await supabase
      .from('roteiros')
      .update({ status: 'concluido' })
      .eq('id', visita.roteiro_id);
  } else {
    await supabase
      .from('roteiros')
      .update({ status: 'em_andamento' })
      .eq('id', visita.roteiro_id);
  }

  return visitaData;
}
