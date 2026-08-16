import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/gestor/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <>
      <PageHeader title="Visão Geral" description="Resumo do desempenho da operação hoje." />
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

