import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export const Route = createFileRoute("/gestor/visitas/")({
  component: Visitas,
});

function Visitas() {
  const visitas = [
    { id: 1, promotor: "João Silva", loja: "Pão de Açúcar - Bela Vista", status: "Concluído", ruptura: "0%", data: "16/08/2026" },
    { id: 2, promotor: "Maria Santos", loja: "Carrefour - Brooklin", status: "Em andamento", ruptura: "-", data: "16/08/2026" },
  ];

  return (
    <>
      <PageHeader title="Visitas" description="Acompanhamento em tempo real das visitas em campo." />
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Promotor</th>
                <th className="px-6 py-4 font-medium">Loja</th>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Ruptura</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visitas.map((v) => (
                <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">{v.promotor}</td>
                  <td className="px-6 py-4">{v.loja}</td>
                  <td className="px-6 py-4">{v.data}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${v.status === 'Concluído' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{v.ruptura}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon"><Eye size={18} /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}
