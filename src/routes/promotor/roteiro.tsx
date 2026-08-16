
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ArrowRight, Loader2 } from "lucide-react";
import { usePromotorRoteiros } from "@/hooks/use-promotor-roteiros";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/promotor/roteiro")({
  component: Roteiro,
});

function Roteiro() {
  const { roteiros, loading } = usePromotorRoteiros();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <PageHeader 
        title="Meu Roteiro" 
        description={roteiros.length > 0 ? `Você tem ${roteiros.length} visitas planejadas.` : "Nenhuma visita planejadas para hoje."} 
      />
      
      <div className="grid gap-4">
        {roteiros.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Tudo certo por aqui! Você não tem roteiros para hoje.
            </CardContent>
          </Card>
        )}
        
        {roteiros.map((roteiro) => (
          <Card key={roteiro.id} className={roteiro.status === 'concluido' ? "opacity-60" : ""}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-secondary p-3 rounded-full">
                  <MapPin size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{roteiro.loja?.nome}</h3>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {roteiro.horario_previsto || "Sem horário"}
                    </div>
                    <div>{format(new Date(roteiro.data_prevista), "dd/MM/yyyy", { locale: ptBR })}</div>
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant={roteiro.status === 'concluido' ? "outline" : "default"}
                onClick={() => navigate({ to: `/promotor/visita/${roteiro.id}` as any })}
              >
                {roteiro.status === 'concluido' ? "Ver Resumo" : roteiro.status === 'em_andamento' ? "Continuar" : "Iniciar"}
                <ArrowRight className="ml-2" size={14} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


