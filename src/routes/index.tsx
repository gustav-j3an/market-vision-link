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
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">TradeVision</h1>
        <p className="mt-2 text-muted-foreground">Conectando campo e inteligência</p>
      </div>

      <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
        <Card className="hover:border-primary transition-all cursor-pointer group" onClick={() => navigate({ to: "/gestor/dashboard" as any })}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Briefcase size={32} />
            </div>
            <CardTitle>Gestor da Indústria</CardTitle>
            <CardDescription>Acesse dashboards analíticos e relatórios estratégicos.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" className="w-full">Acessar Painel</Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-all cursor-pointer group" onClick={() => navigate({ to: "/promotor/roteiro" as any })}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <UserCircle size={32} />
            </div>
            <CardTitle>Promotor de Campo</CardTitle>
            <CardDescription>Gerencie seu roteiro e registre suas visitas diárias.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" className="w-full">Iniciar Roteiro</Button>
          </CardContent>
        </Card>
      </div>
      
      <footer className="mt-12 text-sm text-muted-foreground">
        &copy; 2026 TradeVision. Todos os direitos reservados.
      </footer>
    </div>
  );
}
