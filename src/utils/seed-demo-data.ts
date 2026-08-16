
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, format, addDays } from "date-fns";

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

  // 2. Seed Industries
  const industriesList = [
    { nome: "Ambev", marca: "Ambev", categoria: "Bebidas", empresa_id: empresaId, status: 'ativo' },
    { nome: "Coca-Cola", marca: "Coca-Cola", categoria: "Bebidas", empresa_id: empresaId, status: 'ativo' },
    { nome: "Nestlé", marca: "Nestlé", categoria: "Alimentos", empresa_id: empresaId, status: 'ativo' },
  ];

  const { data: existingIndustries } = await supabase.from("industrias").select("id, nome").eq("empresa_id", empresaId);
  const industriesToInsert = industriesList.filter(ind => !existingIndustries?.some(ei => ei.nome === ind.nome));

  if (industriesToInsert.length > 0) {
    const { error: indError } = await supabase.from("industrias").insert(industriesToInsert);
    if (indError) throw indError;
  }

  const { data: allIndustries } = await supabase.from("industrias").select("id, nome").eq("empresa_id", empresaId);
  const ambev = allIndustries?.find(i => i.nome === "Ambev");
  const coca = allIndustries?.find(i => i.nome === "Coca-Cola");
  const nestle = allIndustries?.find(i => i.nome === "Nestlé");

  // 3. Seed Products linked to industries
  const productsList = [
    { nome: "Cerveja Brahma 600ml", marca: "Brahma", categoria: "Cervejas", sku: "BRA-600", industria_id: ambev?.id, empresa_id: empresaId },
    { nome: "Cerveja Skol 600ml", marca: "Skol", categoria: "Cervejas", sku: "SKO-600", industria_id: ambev?.id, empresa_id: empresaId },
    { nome: "Coca-Cola 2L", marca: "Coca-Cola", categoria: "Refrigerantes", sku: "COC-2L", industria_id: coca?.id, empresa_id: empresaId },
    { nome: "Fanta Laranja 2L", marca: "Fanta", categoria: "Refrigerantes", sku: "FAN-2L", industria_id: coca?.id, empresa_id: empresaId },
    { nome: "Nescau 400g", marca: "Nestlé", categoria: "Achocolatados", sku: "NES-400", industria_id: nestle?.id, empresa_id: empresaId },
    { nome: "Leite Ninho 1kg", marca: "Ninho", categoria: "Leites", sku: "NIN-1KG", industria_id: nestle?.id, empresa_id: empresaId },
  ];
  
  const productSkus = productsList.map(p => p.sku).filter(Boolean) as string[];
  const { data: existingProducts } = await supabase.from("produtos").select("id, sku").eq("empresa_id", empresaId).in("sku", productSkus);
  const existingSkus = (existingProducts?.map(p => p.sku).filter(Boolean) as string[]) || [];

  const productsToInsert = productsList.filter(p => p.sku && !existingSkus.includes(p.sku));

  if (productsToInsert.length > 0) {
    const { error: productsError } = await supabase.from("produtos").insert(productsToInsert);
    if (productsError) throw productsError;
  }

  const { data: allProducts } = await supabase.from("produtos").select("id, nome, industria_id").eq("empresa_id", empresaId);

  // 4. Seed Stores
  const storesList = [
    { nome: "Pão de Açúcar - Jardins", rede: "GPA", endereco: "Av. Paulista, 1000", cidade: "São Paulo", estado: "SP", empresa_id: empresaId },
    { nome: "Carrefour - Brooklin", rede: "Carrefour", endereco: "Rua Brooklin, 500", cidade: "São Paulo", estado: "SP", empresa_id: empresaId },
    { nome: "Extra - Itaim", rede: "GPA", endereco: "Av. Brigadeiro, 2000", cidade: "São Paulo", estado: "SP", empresa_id: empresaId },
  ];
  
  const { data: existingStores } = await supabase.from("lojas").select("id, nome, rede").eq("empresa_id", empresaId);
  const storesToInsert = storesList.filter(s => !existingStores?.some(es => es.nome === s.nome && es.rede === s.rede));

  if (storesToInsert.length > 0) {
    const { error: storesError } = await supabase.from("lojas").insert(storesToInsert);
    if (storesError) throw storesError;
  }

  const { data: allStores } = await supabase.from("lojas").select("id, nome").eq("empresa_id", empresaId);

  // 5. Seed Promoter and Industry Link
  const { data: promotorRecord } = await supabase
    .from("promotores")
    .upsert({ perfil_id: targetProfileId, empresa_id: empresaId, regiao: "São Paulo Capital" }, { onConflict: 'perfil_id' })
    .select()
    .single();
  
  if (promotorRecord && allIndustries) {
    const promoterIndustries = allIndustries.map(ind => ({
      promotor_id: promotorRecord.id,
      industria_id: ind.id,
      status: 'ativo'
    }));
    await supabase.from("promotores_industrias").upsert(promoterIndustries, { onConflict: 'promotor_id,industria_id' });
  }

  // 6. Seed Roteiro Semanal and Paradas for Today
  if (promotorRecord?.id && allStores && allStores.length > 0 && allIndustries && allIndustries.length > 0) {
    const promotorId = promotorRecord.id;
    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const semanaRef = format(startOfCurrentWeek, "yyyy-MM-dd");

    // 6.1 Roteiro Semanal
    const { data: roteiroSemanal, error: rsError } = await supabase
      .from("roteiros_semanais")
      .upsert({
        promotor_id: promotorId,
        empresa_id: empresaId,
        semana_referencia: semanaRef,
        status: 'publicado'
      }, { onConflict: 'promotor_id,semana_referencia' })
      .select()
      .single();

    if (rsError) throw rsError;

    // 6.2 Paradas for Today
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay(); // Monday=1, Sunday=0 -> 6 (Sat as fallback)

    const { data: existingParadas } = await supabase
      .from("paradas_roteiro")
      .select("id")
      .eq('roteiro_semanal_id', roteiroSemanal.id)
      .eq('data', todayStr);

    if (!existingParadas || existingParadas.length === 0) {
      // Create 3 stops for today with different industries
      const paradasToInsert = [
        {
          roteiro_semanal_id: roteiroSemanal.id,
          promotor_id: promotorId,
          loja_id: allStores[0].id,
          industria_id: ambev?.id,
          dia_semana: dayOfWeek,
          data: todayStr,
          horario_previsto: "08:00:00",
          ordem: 1,
          status: 'pendente'
        },
        {
          roteiro_semanal_id: roteiroSemanal.id,
          promotor_id: promotorId,
          loja_id: allStores[1].id,
          industria_id: coca?.id,
          dia_semana: dayOfWeek,
          data: todayStr,
          horario_previsto: "10:30:00",
          ordem: 2,
          status: 'pendente'
        },
        {
          roteiro_semanal_id: roteiroSemanal.id,
          promotor_id: promotorId,
          loja_id: allStores[2].id,
          industria_id: nestle?.id,
          dia_semana: dayOfWeek,
          data: todayStr,
          horario_previsto: "14:00:00",
          ordem: 3,
          status: 'pendente'
        }
      ].filter(p => p.industria_id);

      const { data: createdParadas, error: paradasError } = await supabase
        .from("paradas_roteiro")
        .insert(paradasToInsert)
        .select();

      if (paradasError) throw paradasError;

      // 7. Complete the first parada with a visit
      if (createdParadas && createdParadas.length > 0) {
        const parada = createdParadas[0];
        const now = new Date();
        const startTime = new Date(now.getTime() - 1000 * 60 * 45).toISOString();
        const endTime = now.toISOString();

        const { data: visit, error: visitError } = await supabase
          .from("visitas")
          .insert({
            parada_id: parada.id,
            promotor_id: promotorId,
            loja_id: parada.loja_id,
            industria_id: parada.industria_id,
            inicio: startTime,
            fim: endTime,
            status: 'concluida',
            nota_execucao: 90,
            observacoes: "Execução Ambev realizada com sucesso. Ruptura identificada no SKU Brahma 600ml.",
            empresa_id: empresaId
          } as any)
          .select()
          .single();

        if (visitError) throw visitError;

        // 8. Visit Items (only for the industry of the parada)
        const industryProducts = allProducts.filter(p => p.industria_id === parada.industria_id);
        const visitItems = industryProducts.map(p => ({
          visita_id: visit.id,
          produto_id: p.id,
          status: (p.nome?.includes("Brahma") ? 'ruptura' : 'em_estoque') as any,
          preco: 9.90
        }));

        await supabase.from("itens_visita").insert(visitItems as any);

        // 9. Photos
        const visitPhotos = [
          {
            visita_id: visit.id,
            caminho_arquivo: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
            legenda: "Check-in realizado"
          }
        ];
        await supabase.from("fotos_visita").insert(visitPhotos as any);

        // 10. Update Parada status
        await supabase.from("paradas_roteiro").update({ status: 'concluida' }).eq('id', parada.id);
      }
    }
  }

  return true;
}
