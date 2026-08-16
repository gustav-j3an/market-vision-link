import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Building2, UserCircle2 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingComponent,
});

function OnboardingComponent() {
  const { user, profile, isLoading, refreshProfile } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [gestorName, setGestorName] = useState(profile?.nome || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  if (profile?.empresa_id) {
    return <Navigate to={profile.tipo === "gestor" ? "/gestor/dashboard" : "/promotor/roteiro"} />;
  }

  const handleGestorOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Criar empresa
      const slug = companyName.toLowerCase().trim().replace(/\s+/g, "-");
      const { data: company, error: companyError } = await supabase
        .from("empresas")
        .insert({ nome: companyName, slug })
        .select()
        .single();

      if (companyError) throw companyError;

      // 2. Atualizar perfil com a empresa e nome (caso tenha mudado)
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ 
          empresa_id: company.id,
          nome: gestorName 
        })
        .eq("id", user.id);

      if (profileUpdateError) throw profileUpdateError;

      toast.success("Perfil configurado com sucesso!");
      await refreshProfile();
      navigate({ to: "/gestor/dashboard" as any });
    } catch (error: any) {
      toast.error(error.message || "Erro ao configurar onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromotorOnboarding = async () => {
    // Por enquanto, vinculamos a uma empresa demo ou a primeira encontrada para testes
    // Em um cenário real, ele buscaria por um código ou nome
    setIsSubmitting(true);
    try {
      const { data: companies } = await supabase.from("empresas").select("id").limit(1);
      const companyId = companies?.[0]?.id;

      if (!companyId) throw new Error("Nenhuma empresa encontrada para vincular o promotor. Entre em contato com seu gestor.");

      const { error } = await supabase
        .from("profiles")
        .update({ empresa_id: companyId })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Perfil vinculado com sucesso!");
      await refreshProfile();
      navigate({ to: "/promotor/roteiro" as any });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            TradeVision
          </CardTitle>
          <CardDescription className="text-lg">
            {profile?.tipo === "gestor" 
              ? "Seja bem-vindo, Gestor! Vamos configurar sua empresa." 
              : "Olá, Promotor! Vamos conectar você à sua equipe."}
          </CardDescription>
        </CardHeader>
        
        {profile?.tipo === "gestor" ? (
          <form onSubmit={handleGestorOnboarding}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gestorName" className="flex items-center gap-2">
                  <UserCircle2 size={16} className="text-primary" />
                  Seu Nome de Gestor
                </Label>
                <Input 
                  id="gestorName" 
                  value={gestorName} 
                  onChange={(e) => setGestorName(e.target.value)}
                  placeholder="Seu nome completo"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName" className="flex items-center gap-2">
                  <Building2 size={16} className="text-primary" />
                  Nome da sua Indústria/Empresa
                </Label>
                <Input 
                  id="companyName" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Coca-Cola, Nestlé, Indústria Local"
                  required 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Concluir Configuração"}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-6 text-center py-8">
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
              <p className="text-muted-foreground mb-6">
                Para começar a registrar suas visitas, você precisa estar vinculado a uma indústria.
              </p>
              <Button 
                onClick={handlePromotorOnboarding} 
                className="w-full h-12 text-lg" 
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Vincular à Empresa Exemplo"}
              </Button>
              <p className="text-xs text-muted-foreground mt-4 italic">
                (Em produção, você digitaria um código de convite ou buscaria sua empresa)
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
