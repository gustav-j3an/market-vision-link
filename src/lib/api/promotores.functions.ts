
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getIndustriasForPromoter = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ promoterId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { data: industs, error } = await supabase
      .from('promotores_industrias')
      .select(`
        industria:industrias (
          id,
          nome,
          marca,
          categoria
        )
      `)
      .eq('promotor_id', data.promoterId)
      .eq('status', 'ativo');

    if (error) throw error;
    return industs.map(i => i.industria);
  });

export const vincularPromotorIndustria = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ 
    promoterId: z.string(), 
    industriaId: z.string() 
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from('promotores_industrias')
      .upsert({
        promotor_id: data.promoterId,
        industria_id: data.industriaId,
        status: 'ativo'
      }, { onConflict: 'promotor_id,industria_id' });

    if (error) throw error;
    return { success: true };
  });

export const desvincularPromotorIndustria = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ 
    promoterId: z.string(), 
    industriaId: z.string() 
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from('promotores_industrias')
      .update({ status: 'inativo' })
      .eq('promotor_id', data.promoterId)
      .eq('industria_id', data.industriaId);

    if (error) throw error;
    return { success: true };
  });

export const invitePromoter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({
    nome: z.string(),
    email: z.string().email(),
    regiao: z.string(),
    empresa_id: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // 1. Invite user
    const { data: authUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      data.email,
      { data: { nome: data.nome, tipo: 'promotor', empresa_id: data.empresa_id } }
    );
    
    if (inviteError) throw inviteError;

    // 2. Profile and promoter records are usually handled by triggers or manual insert
    // But since we are in admin mode, let's ensure the profile exists with correct data
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authUser.user.id,
        nome: data.nome,
        email: data.email,
        tipo: 'promotor',
        empresa_id: data.empresa_id
      });
      
    if (profileError) throw profileError;

    const { error: promotorError } = await supabaseAdmin
      .from('promotores')
      .upsert({
        perfil_id: authUser.user.id,
        empresa_id: data.empresa_id,
        regiao: data.regiao
      });

    if (promotorError) throw promotorError;
    
    return { success: true };
  });

export const updatePromoterData = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({
    id: z.string(),
    nome: z.string(),
    regiao: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Get profile ID from promoter ID first
    const { data: promoter, error: fetchError } = await supabaseAdmin
      .from('promotores')
      .select('perfil_id')
      .eq('id', data.id)
      .single();
      
    if (fetchError) throw fetchError;

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ nome: data.nome })
      .eq('id', promoter.perfil_id);
      
    if (profileError) throw profileError;

    const { error: promotorError } = await supabaseAdmin
      .from('promotores')
      .update({ regiao: data.regiao })
      .eq('id', data.id);

    if (promotorError) throw promotorError;
    
    return { success: true };
  });
