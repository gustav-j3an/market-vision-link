
import { supabase } from "@/integrations/supabase/client";

export async function seedDemoData(empresaId: string, gestorProfileId: string) {
  // 1. Get or Create a Demo Promoter Profile
  let targetProfileId = gestorProfileId;
  const { data: currentProfile } = await supabase.from("profiles").select("tipo").eq("id", gestorProfileId).single();
  
  if (currentProfile?.tipo !== "promotor") {
    const { data: otherPromoter } = await supabase
      .from("profiles")
      .select("id")
      .eq("empresa_id", empresaId)
      .eq("tipo", "promotor")
      .limit(1)
      .maybeSingle();
      
    if (otherPromoter) {
      targetProfileId = otherPromoter.id;
    }
  }

  // 2. Seed Products (Avoid duplicates by SKU)
  const productSkus = ["SUC-001", "CER-001", "AGU-001", "REF-001"];
  const { data: existingProducts } = await supabase.from("produtos").select("sku").eq("empresa_id", empresaId).in("sku", productSkus);
  const existingSkus = existingProducts?.map(p => p.sku) || [];

  const productsToInsert = [
    { nome: "Suco RefrescaCo Laranja 1L", marca: "RefrescaCo", categoria: "Bebidas", sku: "SUC-001", empresa_id: empresaId },
    { nome: "Cerveja Artesanal Br 600ml", marca: "Cervejaria BR", categoria: "Bebidas", sku: "CER-001", empresa_id: empresaId },
    { nome: "Água Pura 500ml", marca: "Água Pura", categoria: "Bebidas", sku: "AGU-001", empresa_id: empresaId },
    { nome: "Refrigerante Cola 2L", marca: "RefrescaCo", categoria: "Bebidas", sku: "REF-001", empresa_id: empresaId },
  ].filter(p => !existingSkus.includes(p.sku));

  if (productsToInsert.length > 0) {
    const { error: productsError } = await supabase.from("produtos").insert(productsToInsert);
    if (productsError) throw productsError;
  }

  // 3. Seed Stores (Avoid duplicates by Name+Rede)
  const { data: existingStores } = await supabase.from("lojas").select("nome, rede").eq("empresa_id", empresaId);
  
  const storesToInsert = [
    { nome: "Pão de Açúcar", rede: "GPA", endereco: "Av. Paulista, 1000", cidade: "São Paulo", estado: "SP", empresa_id: empresaId },
    { nome: "Carrefour", rede: "Carrefour", endereco: "Rua Brooklin, 500", cidade: "São Paulo", estado: "SP", empresa_id: empresaId },
    { nome: "Extra", rede: "GPA", endereco: "Av. Brigadeiro, 2000", cidade: "São Paulo", estado: "SP", empresa_id: empresaId },
  ].filter(s => !existingStores?.some(es => es.nome === s.nome && es.rede === s.rede));

  if (storesToInsert.length > 0) {
    const { error: storesError } = await supabase.from("lojas").insert(storesToInsert);
    if (storesError) throw storesError;
  }

  const { data: allStores } = await supabase.from("lojas").select("id").eq("empresa_id", empresaId);

  // 4. Seed Promoter Record
  const { data: promotorRecord, error: promotorError } = await supabase
    .from("promotores")
    .upsert({ perfil_id: targetProfileId, empresa_id: empresaId, regiao: "Centro-Sul" }, { onConflict: 'perfil_id' })
    .select()
    .single();
  
  if (promotorError) throw promotorError;

  // 5. Seed Roteiros for Today
  if (promotorRecord && promotorRecord.id && allStores && allStores.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingRoteiros } = await supabase
      .from("roteiros")
      .select("loja_id")
      .eq("promotor_id", promotorRecord.id as string)
      .eq("data_prevista", today);
      
    const existingStoreIds = existingRoteiros?.map(r => r.loja_id) || [];

    const roteirosToInsert = allStores
      .filter(s => !existingStoreIds.includes(s.id))
      .map(store => ({
        promotor_id: (promotorRecord as any).id,
        loja_id: store.id,
        data_prevista: today,
        horario_previsto: "09:00",
        status: 'pendente',
        empresa_id: empresaId
      }));

    if (roteirosToInsert.length > 0) {
      const { error: roteirosError } = await supabase.from("roteiros").insert(roteirosToInsert as any);
      if (roteirosError) throw roteirosError;
    }
  }

  return true;
}
