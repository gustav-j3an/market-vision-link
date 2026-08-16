import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/gestor/promotores/")({
  component: Promotores,
});

function Promotores() {
  const promotores = [
    { id: 1, nome: "João Silva", regiao: "Centro-Sul", visitas: 25, desempenho: "95%" },
    { id: 2, nome: "Maria Santos", regiao: "Norte", visitas: 22, desempenho: "88%" },
  ];

  return (
    <>
      <PageHeader title="Promotores" description="Equipe em campo e indicadores de performance." />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {promotores.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-6 text-center">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.nome}`} />
                <AvatarFallback>{p.nome[0]}</AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-bold">{p.nome}</h3>
              <p className="text-sm text-muted-foreground mb-4">{p.regiao}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Visitas</p>
                  <p className="font-bold text-primary">{p.visitas}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Execução</p>
                  <p className="font-bold text-success">{p.desempenho}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
