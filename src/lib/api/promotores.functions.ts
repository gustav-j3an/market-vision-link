import { createServerFn } from "@tanstack/react-start";
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
  .inputValidator((data: unknown) => promoterSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Check if email is already linked to a promoter in the same company
    // We check in profiles first to see if user exists, then if they are a promoter in this company
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, promotores(id, empresa_id)")
      .eq("email", data.email)
      .maybeSingle();

    if (profileCheckError) throw profileCheckError;
    
    const isAlreadyPromoterInCompany = existingProfile?.promotores?.some(
      (p: any) => p.empresa_id === data.empresa_id
    );

    if (isAlreadyPromoterInCompany) {
      throw new Error("Este e-mail já está vinculado a um promotor nesta empresa.");
    }

    let userId: string;

    if (!existingProfile) {
      // 2. Invite user via Supabase Auth
      const { data: authUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        data.email,
        {
          data: {
            nome: data.nome,
            empresa_id: data.empresa_id,
          }
        }
      );

      if (inviteError) throw inviteError;
      if (!authUser.user) throw new Error("Falha ao criar usuário.");
      userId = authUser.user.id;
    } else {
      userId = existingProfile.id;
    }

    // 3. Update/Setup profile
    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({
        nome: data.nome,
        tipo: "promotor",
        empresa_id: data.empresa_id,
        foto_url: data.foto_url,
      } as any)
      .eq("id", userId);

    if (profileUpdateError) throw profileUpdateError;

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

    return { success: true, promoter: newPromoter };
  });

export const updatePromoterData = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({
    id: z.string().uuid(),
    nome: z.string().min(2).optional(),
    regiao: z.string().min(2).optional(),
    foto_url: z.string().optional(),
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
        } as any)
        .eq("id", promoter.perfil_id);
      
      if (profileError) throw profileError;
    }

    // Update promoter
    if (data.regiao) {
      const { error: promoterError } = await supabaseAdmin
        .from("promotores")
        .update({
          regiao: data.regiao,
        })
        .eq("id", data.id);

      if (promoterError) throw promoterError;
    }

    return { success: true };
  });

