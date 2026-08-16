
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Loader2, AlertTriangle, TrendingDown, CheckCircle2, Users, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { seedDemoData } from "@/utils/seed-demo-data";
import { toast } from "sonner";
import { getDashboardStats } from "@/lib/api/dashboard.functions";

export const Route = createFileRoute("/gestor/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { profile } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    if (!profile?.empresa_id) return;
    setIsLoading(true);
    try {
      const data = await getDashboardStats({ 
        data: { empresaId: profile.empresa_id, period: 'day' } 
      });
      setStats(data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      toast.error("Não foi possível carregar os dados do dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [profile?.empresa_id]);

  const handleSeed = async () => {
    if (!profile?.empresa_id) return;
    setIsSeeding(true);
    try {
      await seedDemoData(profile.empresa_id, profile.id);
      toast.success("Dados de demonstração carregados com sucesso!");
      loadStats(); // Recarregar estatísticas após seed
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpis = [
    { 
      title: "Visitas Realizadas", 
      value: stats?.stats?.visitasRealizadas || 0, 
      subtitle: `de ${stats?.stats?.visitasPlanejadas || 0} planejadas`,
      icon: CheckCircle2,
      color: "text-green-600"
    },
    { 
      title: "Taxa de Ruptura", 
      value: stats?.stats?.taxaRuptura || "0%", 
      subtitle: "Itens não encontrados",
      icon: TrendingDown,
      color: "text-red-600"
    },
    { 
      title: "Execução Média", 
      value: stats?.stats?.execucaoMedia || "0%", 
      subtitle: "Qualidade da exposição",
      icon: TrendingDown,
      color: "text-blue-600"
    },
    { 
      title: "Lojas Visitadas", 
      value: stats?.stats?.lojasVisitadas || 0, 
      subtitle: "Pontos de venda únicos",
      icon: ShoppingBag,
      color: "text-purple-600"
    },
  ];

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpis.map((item) => (
          <Card key={item.title}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Seção de Alertas */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertas da Operação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.alertas?.length > 0 ? (
              <div className="space-y-4">
                {stats.alertas.map((alerta: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-lg border flex gap-3 ${
                    alerta.severity === 'destructive' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
                  }`}>
                    <div className="mt-1">
                      <AlertTriangle className={`h-4 w-4 ${
                        alerta.severity === 'destructive' ? 'text-red-600' : 'text-amber-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${
                        alerta.severity === 'destructive' ? 'text-red-900' : 'text-amber-900'
                      }`}>{alerta.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{alerta.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">Tudo certo! Nenhum alerta crítico hoje.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Placeholder para Gráficos Futuros */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Desempenho da Semana</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center border border-dashed rounded-lg m-6">
            <div className="text-center">
              <TrendingDown className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-20" />
              <p className="text-sm text-muted-foreground">Gráficos de tendência em desenvolvimento.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats?.stats?.visitasPlanejadas === 0 && !isSeeding && (
        <Card className="mt-8 bg-blue-50 border-blue-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-700">
              <Database size={24} />
            </div>
            <div>
              <h3 className="font-bold text-blue-900">Comece sua operação</h3>
              <p className="text-sm text-blue-700">
                Ainda não há roteiros planejados para hoje. Crie um roteiro ou use o botão "Carregar Dados Demo" acima para testar o sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
