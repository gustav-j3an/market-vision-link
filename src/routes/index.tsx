import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, UserCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    title: "TradeVision | Bem-vindo",
    meta: [
      { name: "description", content: "Bem-vindo ao TradeVision - SaaS de Trade Marketing" },
    ],
  }),
});

function Index() {
  const { user, profile, isLoading, profileError } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se já estiver logado, redireciona conforme o perfil
  if (user && profile && !profileError) {
    if (!profile.empresa_id) {
      return <Navigate to="/onboarding" replace />;
    } else if (profile.tipo === "gestor") {
      return <Navigate to="/gestor/dashboard" replace />;
    } else if (profile.tipo === "promotor") {
      return <Navigate to="/promotor/roteiro" replace />;
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">TradeVision</h1>
        <p className="mt-2 text-muted-foreground">Conectando campo e inteligência</p>
      </div>

      <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
        <Card className="hover:border-primary transition-all cursor-pointer group" onClick={() => navigate({ to: "/auth/login" as any })}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Briefcase size={32} />
            </div>
            <CardTitle>Gestor da Indústria</CardTitle>
            <CardDescription>Acesse dashboards analíticos e relatórios estratégicos.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" className="w-full">Entrar / Cadastrar</Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-all cursor-pointer group" onClick={() => navigate({ to: "/auth/login" as any })}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <UserCircle size={32} />
            </div>
            <CardTitle>Promotor de Campo</CardTitle>
            <CardDescription>Gerencie seu roteiro e registre suas visitas diárias.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" className="w-full">Entrar</Button>
          </CardContent>
        </Card>
      </div>
      
      <footer className="mt-12 text-sm text-muted-foreground">
        &copy; 2026 TradeVision. Todos os direitos reservados.
      </footer>
    </div>
  );
}
