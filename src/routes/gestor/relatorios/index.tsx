import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/gestor/relatorios/")({
  component: Relatorios,
});

function Relatorios() {
  const relatorios = [
    { title: "Relatório de Rupturas", description: "Análise detalhada de falta de produtos por loja e marca." },
    { title: "Desempenho de Promotores", description: "Métricas de produtividade e qualidade de execução." },
    { title: "Preço Médio por Região", description: "Comparativo de preços praticados nos pontos de venda." },
  ];

  return (
    <>
      <PageHeader title="Relatórios" description="Extraia insights estratégicos da sua operação." />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatorios.map((r) => (
          <Card key={r.title} className="hover:border-primary transition-all">
            <CardContent className="p-6">
              <div className="bg-secondary p-3 w-fit rounded-lg mb-4 text-primary">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">{r.title}</h3>
              <p className="text-sm text-muted-foreground mb-6">{r.description}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download size={16} className="mr-2" /> PDF
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download size={16} className="mr-2" /> Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
