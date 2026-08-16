import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/gestor/lojas/")({
  component: Lojas,
});

function Lojas() {
  const lojas = [
    { id: 1, nome: "Pão de Açúcar", unidade: "Bela Vista", cidade: "São Paulo - SP", ultimaVisita: "16/08/2026" },
    { id: 2, nome: "Carrefour", unidade: "Brooklin", cidade: "São Paulo - SP", ultimaVisita: "16/08/2026" },
  ];

  return (
    <>
      <PageHeader title="Lojas" description="Gerencie as redes e unidades atendidas." />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lojas.map((loja) => (
          <Card key={loja.id} className="hover:border-primary transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <ShoppingCart size={24} />
                </div>
                <Button variant="outline" size="sm">Ver Perfil</Button>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold">{loja.nome}</h3>
                <p className="text-sm text-muted-foreground">{loja.unidade}</p>
                <p className="text-xs text-muted-foreground mt-1">{loja.cidade}</p>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between text-xs text-muted-foreground">
                <span>Última visita:</span>
                <span className="font-medium text-foreground">{loja.ultimaVisita}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
