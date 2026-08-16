
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
  const productsList = [
    { nome: "Suco RefrescaCo Laranja 1L", marca: "RefrescaCo", categoria: "Bebidas", sku: "SUC-001", empresa_id: empresaId },
    { nome: "Cerveja Artesanal Br 600ml", marca: "Cervejaria BR", categoria: "Bebidas", sku: "CER-001", empresa_id: empresaId },
    { nome: "Água Pura 500ml", marca: "Água Pura", categoria: "Bebidas", sku: "AGU-001", empresa_id: empresaId },
    { nome: "Refrigerante Cola 2L", marca: "RefrescaCo", categoria: "Bebidas", sku: "REF-001", empresa_id: empresaId },
  ];
  
  const productSkus = productsList.map(p => p.sku).filter(Boolean) as string[];
  const { data: existingProducts } = await supabase.from("produtos").select("id, sku").eq("empresa_id", empresaId).in("sku", productSkus);
  const existingSkus = existingProducts?.map(p => p.sku).filter(Boolean) as string[] || [];

  const productsToInsert = productsList.filter(p => p.sku && !existingSkus.includes(p.sku));

  if (productsToInsert.length > 0) {
    const { error: productsError } = await supabase.from("produtos").insert(productsToInsert);
    if (productsError) throw productsError;
  }

  const { data: allProducts } = await supabase.from("produtos").select("id, nome").eq("empresa_id", empresaId);

  // 3. Seed Stores (Avoid duplicates by Name+Rede)
  const storesList = [
    { nome: "Pão de Açúcar", rede: "GPA", endereco: "Av. Paulista, 1000", cidade: "São Paulo", estado: "SP", empresa_id: empresaId },
    { nome: "Carrefour", rede: "Carrefour", endereco: "Rua Brooklin, 500", cidade: "São Paulo", estado: "SP", empresa_id: empresaId },
    { nome: "Extra", rede: "GPA", endereco: "Av. Brigadeiro, 2000", cidade: "São Paulo", estado: "SP", empresa_id: empresaId },
  ];
  
  const { data: existingStores } = await supabase.from("lojas").select("id, nome, rede").eq("empresa_id", empresaId);
  
  const storesToInsert = storesList.filter(s => !existingStores?.some(es => es.nome === s.nome && es.rede === s.rede));

  if (storesToInsert.length > 0) {
    const { error: storesError } = await supabase.from("lojas").insert(storesToInsert);
    if (storesError) throw storesError;
  }

  const { data: allStores } = await supabase.from("lojas").select("id, nome").eq("empresa_id", empresaId);

  // 4. Seed Promoter Record
  const { data: promotorRecord, error: promotorError } = await supabase
    .from("promotores")
    .upsert({ perfil_id: targetProfileId, empresa_id: empresaId, regiao: "Centro-Sul" }, { onConflict: 'perfil_id' })
    .select()
    .single();
  
  if (promotorError) throw promotorError;

  // 5. Seed Roteiros and a Finished Visit for Today
  if (promotorRecord?.id && allStores && allStores.length > 0 && allProducts && allProducts.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const promotorId = promotorRecord.id;
    
    const { data: existingRoteiros } = await supabase
      .from("roteiros")
      .select("id, loja_id, status")
      .eq('promotor_id', promotorId)
      .eq('data_prevista', today);
      
    const existingStoreIds = existingRoteiros?.map(r => r.loja_id) || [];

    const storesNeedingRoteiro = allStores.filter(s => s.id && !existingStoreIds.includes(s.id));
    
    if (storesNeedingRoteiro.length > 0) {
      const roteirosToInsert = storesNeedingRoteiro.map((store, index) => ({
        promotor_id: promotorId,
        loja_id: store.id,
        data_prevista: today,
        horario_previsto: index === 0 ? "08:00" : index === 1 ? "10:30" : "14:00",
        status: 'pendente' as any,
        empresa_id: empresaId
      }));

      const { data: createdRoteiros, error: roteirosError } = await supabase
        .from("roteiros")
        .insert(roteirosToInsert as any)
        .select();
        
      if (roteirosError) throw roteirosError;

      if (createdRoteiros && createdRoteiros.length > 0) {
        const roteiroToComplete = createdRoteiros[0];
        if (!roteiroToComplete) return true;
        
        // 1. Create Visit
        const now = new Date();
        const startTime = new Date(now.getTime() - 1000 * 60 * 45).toISOString(); // 45 mins ago
        const endTime = now.toISOString();

        const { data: visit, error: visitError } = await supabase
          .from("visitas")
          .insert({
            roteiro_id: roteiroToComplete.id,
            promotor_id: promotorId,
            loja_id: roteiroToComplete.loja_id,
            inicio: startTime,
            fim: endTime,
            status: 'concluido' as any,
            nota_execucao: 85,
            observacoes: "Gôndola organizada, porém identificada ruptura no SKU de Refrigerante Cola 2L. Reposição solicitada ao gerente da loja.",
            empresa_id: empresaId
          } as any)
          .select()
          .single();

        if (visitError) throw visitError;
        if (!visit) return true;

        // 2. Create Visit Items
        const visitItems = allProducts.map(p => ({
          visita_id: visit.id,
          produto_id: p.id,
          status: (p.nome?.includes("Cola") ? 'ruptura' : 'em_estoque') as any,
          preco: p.nome?.includes("Suco") ? 8.90 : p.nome?.includes("Cerveja") ? 12.50 : 5.50
        }));

        const { error: itemsError } = await supabase.from("itens_visita").insert(visitItems as any);
        if (itemsError) throw itemsError;

        // 3. Create Visit Photos (using mock URLs from Unsplash)
        const visitPhotos = [
          {
            visita_id: visit.id,
            caminho_arquivo: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
            legenda: "Gôndola de Bebidas - Início da Visita"
          },
          {
            visita_id: visit.id,
            caminho_arquivo: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=800",
            legenda: "Exposição Frontal - Sucos"
          }
        ];

        const { error: photosError } = await supabase.from("fotos_visita").insert(visitPhotos as any);
        if (photosError) throw photosError;

        // 4. Update Roteiro status
        await supabase.from("roteiros").update({ status: 'concluido' }).eq('id', roteiroToComplete.id);
      }
    }
  }

  return true;
}
