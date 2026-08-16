import { supabase } from "@/integrations/supabase/client";

export async function seedDemoData(empresaId: string, profileId: string) {
  // 1. Seed Products
  const products = [
    { nome: "Suco RefrescaCo Laranja 1L", marca: "RefrescaCo", categoria: "Bebidas", sku: "SUC-001", empresa_id: empresaId },
    { nome: "Cerveja Artesanal Br 600ml", marca: "Cervejaria BR", categoria: "Bebidas", sku: "CER-001", empresa_id: empresaId },
    { nome: "Água Pura 500ml", marca: "Água Pura", categoria: "Bebidas", sku: "AGU-001", empresa_id: empresaId },
    { nome: "Refrigerante Cola 2L", marca: "RefrescaCo", categoria: "Bebidas", sku: "REF-001", empresa_id: empresaId },
  ];

  const { error: productsError } = await supabase.from("produtos").insert(products);
  if (productsError) throw productsError;

  // 2. Seed Stores
  const stores = [
    { nome: "Pão de Açúcar", rede: "GPA", endereco: "Av. Paulista, 1000", cidade: "São Paulo", estado: "SP", empresa_id: empresaId },
    { nome: "Carrefour", rede: "Carrefour", endereco: "Rua Brooklin, 500", cidade: "São Paulo", estado: "SP", empresa_id: empresaId },
    { nome: "Extra", rede: "GPA", endereco: "Av. Brigadeiro, 2000", cidade: "São Paulo", estado: "SP", empresa_id: empresaId },
  ];

  const { error: storesError } = await supabase.from("lojas").insert(stores);
  if (storesError) throw storesError;

  // 3. Seed Promoters (limited because it requires profiles, so we just link the current user as a promoter for demo)
  const { error: promoterError } = await supabase.from("promotores").insert([
    { perfil_id: profileId, empresa_id: empresaId, regiao: "Centro-Sul" }
  ]);
  
  if (promoterError) {
     // Might fail if profile is already a promoter, ignoring for now as it's a seed
     console.warn("Promoter seeding might have skipped or failed:", promoterError);
  }

  return true;
}
