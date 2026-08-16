
import { createServerFn } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getIndustriasForPromoter = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ promoterId: z.string() }).parse(data))
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
  .inputValidator((data) => z.object({ 
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
  .inputValidator((data) => z.object({ 
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
