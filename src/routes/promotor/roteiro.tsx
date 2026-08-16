import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/promotor/roteiro")({
  component: Roteiro,
});

function Roteiro() {
  const lojas = [
    { id: 1, nome: "Pão de Açúcar - Bela Vista", horario: "09:00", status: "Pendente" },
    { id: 2, nome: "Carrefour - Brooklin", horario: "11:30", status: "Pendente" },
  ];

  return (
    <>
      <PageHeader title="Meu Roteiro" description="Olá, Promotor. Você tem 2 visitas planejadas para hoje." />
      <div className="grid gap-4">
        {lojas.map((loja) => (
          <Card key={loja.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-secondary p-3 rounded-full">
                  <MapPin size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{loja.nome}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock size={14} />
                    {loja.horario}
                  </div>
                </div>
              </div>
              <Button size="sm">
                Iniciar <ArrowRight className="ml-2" size={14} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

