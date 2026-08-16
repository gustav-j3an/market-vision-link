
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Loader2, AlertTriangle, CheckCircle2, ShoppingBag, PackageX, BarChart3, Factory } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { seedDemoData } from "@/utils/seed-demo-data";
import { toast } from "sonner";
import { getDashboardStats } from "@/lib/api/dashboard.functions";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getIndustrias, Industria } from "@/lib/api/industrias";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/gestor/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { profile } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [industrias, setIndustrias] = useState<Industria[]>([]);
  const [selectedIndustria, setSelectedIndustria] = useState<string>("all");

  const loadInitialData = async () => {
    if (!profile?.empresa_id) return;
    try {
      const data = await getIndustrias(profile.empresa_id);
      setIndustrias(data);
    } catch (error) {
      console.error("Erro ao carregar indústrias:", error);
    }
  };

  const loadStats = async () => {
    if (!profile?.empresa_id) return;
    setIsLoading(true);
    try {
      const data = await getDashboardStats({ 
        data: { 
          empresaId: profile.empresa_id, 
          period: 'week',
          industriaId: selectedIndustria === "all" ? undefined : selectedIndustria
        } 
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
    loadInitialData();
  }, [profile?.empresa_id]);

  useEffect(() => {
    loadStats();
  }, [profile?.empresa_id, selectedIndustria]);

  const handleSeed = async () => {
    if (!profile?.empresa_id) return;
    setIsSeeding(true);
    try {
      await seedDemoData(profile.empresa_id, profile.id);
      toast.success("Dados de demonstração carregados com sucesso!");
      await loadInitialData();
      await loadStats();
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading && !stats) {
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
      value: stats?.stats?.taxaRuptura || "0.0%", 
      subtitle: "Itens em falta",
      icon: PackageX,
      color: "text-red-600"
    },
    { 
      title: "Execução Média", 
      value: stats?.stats?.execucaoMedia || "0.0%", 
      subtitle: "Conformidade no PDV",
      icon: BarChart3,
      color: "text-blue-600"
    },
    { 
      title: "Promotores Ativos", 
      value: stats?.stats?.promotoresAtivos || 0, 
      subtitle: "Equipe em campo",
      icon: ShoppingBag,
      color: "text-purple-600"
    },
  ];

  return (
    <>
      <PageHeader 
        title="Dashboard Executivo" 
        description="Acompanhamento em tempo real da execução em campo."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-md border px-3 h-10">
              <Factory className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedIndustria} onValueChange={setSelectedIndustria}>
                <SelectTrigger className="border-none shadow-none focus:ring-0 w-[180px] h-8 p-0">
                  <SelectValue placeholder="Todas as Indústrias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Indústrias</SelectItem>
                  {industrias.map(ind => (
                    <SelectItem key={ind.id} value={ind.id}>{ind.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={handleSeed} disabled={isSeeding}>
              {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
              Carregar Dados Demo
            </Button>
          </div>
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

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Alertas */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertas Prioritários
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.alertas?.length > 0 ? (
              <div className="space-y-4">
                {stats.alertas.map((alerta: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-lg border flex gap-3 ${
                    alerta.severity === 'destructive' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${
                      alerta.severity === 'destructive' ? 'text-red-600' : 'text-amber-600'
                    }`} />
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
              <div className="text-center py-12 border border-dashed rounded-lg bg-slate-50/50">
                <CheckCircle2 className="mx-auto h-8 w-8 text-green-500 opacity-20 mb-2" />
                <p className="text-sm text-muted-foreground">Toda a operação está em conformidade.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evolução de Visitas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Evolução Diária de Visitas</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            {stats?.evolucao?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.evolucao}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} width={30} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#003366" 
                    strokeWidth={3} 
                    dot={{ fill: '#003366', r: 4 }} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">Sem dados históricos suficientes.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Ranking de Rupturas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Produtos em Ruptura Crítica</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.rankingRuptura?.length > 0 ? (
              <div className="space-y-4">
                {stats.rankingRuptura.map((prod: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center text-red-700 font-bold text-xs">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium">{prod.nome}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-600">{prod.count}</span>
                      <span className="text-xs text-muted-foreground uppercase">ocorrências</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">Nenhuma ruptura registrada no período.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informação Incial / Empty State */}
        {((stats?.stats?.visitasPlanejadas === 0) || (stats?.stats?.visitasRealizadas === 0 && stats?.stats?.visitasPlanejadas > 0)) && !isSeeding && (
          <Card className="bg-blue-50 border-blue-100 flex flex-col justify-center">
            <CardContent className="p-8 text-center">
              <div className="bg-blue-100 p-4 rounded-full text-blue-700 w-fit mx-auto mb-4">
                <Database size={32} />
              </div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                {stats?.stats?.visitasPlanejadas === 0 ? "Primeiros Passos" : "Aguardando Visitas"}
              </h3>
              <p className="text-sm text-blue-700 max-w-sm mx-auto">
                {stats?.stats?.visitasPlanejadas === 0 
                  ? "Não identificamos roteiros planejados. Cadastre roteiros para seus promotores ou use os dados de demonstração para explorar os recursos analíticos."
                  : "Os roteiros foram criados, mas nenhuma visita foi finalizada hoje. Acompanhe o progresso da equipe em tempo real assim que os promotores iniciarem as atividades."}
              </p>
              {stats?.stats?.visitasPlanejadas === 0 && (
                <Button 
                  onClick={() => toast.info("Navegue até a aba 'Roteiros' para cadastrar.")} 
                  variant="link" 
                  className="mt-4 text-blue-700 underline"
                >
                  Como criar roteiros?
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
