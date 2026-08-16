import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { seedDemoData } from "@/utils/seed-demo-data";
import { toast } from "sonner";

export const Route = createFileRoute("/gestor/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { profile } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    if (!profile?.empresa_id) return;
    setIsSeeding(true);
    try {
      await seedDemoData(profile.empresa_id, profile.id);
      toast.success("Dados de demonstração carregados com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <>
      <PageHeader 
        title="Visão Geral" 
        description="Resumo do desempenho da operação hoje."
        actions={
          <Button variant="outline" onClick={handleSeed} disabled={isSeeding}>
            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Carregar Dados Demo
          </Button>
        }
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Visitas Realizadas", value: "45", subtitle: "de 50 planejadas" },
          { title: "Taxa de Ruptura", value: "12%", subtitle: "Abaixo da meta (15%)" },
          { title: "Execução Média", value: "85%", subtitle: "Dentro da conformidade" },
          { title: "Promotores Ativos", value: "12", subtitle: "Online" },
        ].map((item) => (
          <Card key={item.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

