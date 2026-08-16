
import { supabase } from "@/integrations/supabase/client";

export async function seedDemoData(empresaId: string, profileId: string) {
  // 1. Seed Products
  const products = [
    { nome: "Suco RefrescaCo Laranja 1L", marca: "RefrescaCo", categoria: "Bebidas", sku: "SUC-001", empresa_id: empresaId },
    { nome: "Cerveja Artesanal Br 600ml", marca: "Cervejaria BR", categoria: "Bebidas", sku: "CER-001", empresa_id: empresaId },
    { nome: "Água Pura 500ml", marca: "Água Pura", categoria: "Bebidas", sku: "AGU-001", empresa_id: empresaId },
    { nome: "Refrigerante Cola 2L", marca: "RefrescaCo", categoria: "Bebidas", sku: "REF-001", empresa_id: empresaId },
  ];

  const { data: insertedProducts, error: productsError } = await supabase.from("produtos").insert(products).select();
  if (productsError) throw productsError;

  // 2. Seed Stores
  const stores = [
    { nome: "Pão de Açúcar", rede: "GPA", endereco: "Av. Paulista, 1000", cidade: "São Paulo", estado: "SP", empresa_id: empresaId },
    { nome: "Carrefour", rede: "Carrefour", endereco: "Rua Brooklin, 500", cidade: "São Paulo", estado: "SP", empresa_id: empresaId },
    { nome: "Extra", rede: "GPA", endereco: "Av. Brigadeiro, 2000", cidade: "São Paulo", estado: "SP", empresa_id: empresaId },
  ];

  const { data: insertedStores, error: storesError } = await supabase.from("lojas").insert(stores).select();
  if (storesError) throw storesError;

  // 3. Seed Promoters
  const { data: promotorData, error: promotorError } = await supabase.from("promotores").upsert([
    { perfil_id: profileId, empresa_id: empresaId, regiao: "Centro-Sul" }
  ]).select().single();
  
  if (promotorError) {
     console.warn("Promoter seeding skipped or failed:", promotorError);
  }

  // 4. Seed Roteiros for the current user if they are the promoter
  if (promotorData && insertedStores && insertedStores.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const roteiros = insertedStores.map(store => ({
      promotor_id: promotorData.id,
      loja_id: store.id,
      data_prevista: today,
      horario_previsto: "09:00",
      status: 'pendente',
      empresa_id: empresaId
    }));

    const { error: roteirosError } = await supabase.from("roteiros").insert(roteiros);
    if (roteirosError) console.warn("Roteiros seeding failed:", roteirosError);
  }

  return true;
}