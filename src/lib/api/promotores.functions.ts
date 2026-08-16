import { createServerFn } from "@tanstack/react-router";
import { z } from "zod";

const promoterSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  regiao: z.string().min(2, "Região inválida"),
  telefone: z.string().optional(),
  foto_url: z.string().optional(),
  empresa_id: z.string().uuid(),
});

export const invitePromoter = createServerFn({ method: "POST" })
  .inputValidator((data) => promoterSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Check if email is already linked to a promoter in the same company
    const { data: existingPromoter, error: checkError } = await supabaseAdmin
      .from("promotores")
      .select("*, profiles!inner(email)")
      .eq("empresa_id", data.empresa_id)
      .eq("profiles.email", data.email)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingPromoter) {
      throw new Error("Este e-mail já está vinculado a um promotor nesta empresa.");
    }

    // 2. Invite user via Supabase Auth
    const { data: authUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      data.email,
      {
        data: {
          nome: data.nome,
          empresa_id: data.empresa_id,
        },
        // We'll let them set their password via the email link
      }
    );

    if (inviteError) throw inviteError;
    if (!authUser.user) throw new Error("Falha ao criar usuário.");

    const userId = authUser.user.id;

    // 3. Update profile (profile is created by auth trigger usually, but let's be sure or update it)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        nome: data.nome,
        tipo: "promotor",
        empresa_id: data.empresa_id,
        foto_url: data.foto_url,
      })
      .eq("id", userId);

    if (profileError) throw profileError;

    // 4. Create promoter record
    const { data: newPromoter, error: promoterError } = await supabaseAdmin
      .from("promotores")
      .insert({
        perfil_id: userId,
        empresa_id: data.empresa_id,
        regiao: data.regiao,
      })
      .select()
      .single();

    if (promoterError) throw promoterError;

    // 5. Add to user_roles
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: userId,
        role: "user", // Default role, specific permissions are handled via 'tipo' and RLS
      });
    
    // roleError might happen if unique constraint hits, but it's safe to ignore if already there
    
    return { success: true, promoter: newPromoter };
  });

export const updatePromoterData = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    id: z.string().uuid(),
    nome: z.string().min(2).optional(),
    regiao: z.string().min(2).optional(),
    foto_url: z.string().optional(),
    ativo: z.boolean().optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Get promoter to find profile_id
    const { data: promoter, error: fetchError } = await supabaseAdmin
      .from("promotores")
      .select("perfil_id")
      .eq("id", data.id)
      .single();
    
    if (fetchError) throw fetchError;

    // Update profile
    if (data.nome || data.foto_url !== undefined) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({
          ...(data.nome ? { nome: data.nome } : {}),
          ...(data.foto_url !== undefined ? { foto_url: data.foto_url } : {}),
        })
        .eq("id", promoter.perfil_id);
      
      if (profileError) throw profileError;
    }

    // Update promoter
    const { error: promoterError } = await supabaseAdmin
      .from("promotores")
      .update({
        ...(data.regiao ? { regiao: data.regiao } : {}),
        // Note: we might need a 'status' or 'ativo' column in 'promotores' if we want to deactivate
      })
      .eq("id", data.id);

    if (promoterError) throw promoterError;

    return { success: true };
  });
