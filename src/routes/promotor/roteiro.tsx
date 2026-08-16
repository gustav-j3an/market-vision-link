import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ArrowRight, Loader2, Briefcase } from "lucide-react";
import { usePromotorRoteiros } from "@/hooks/use-promotor-roteiros";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { saveVisita } from "@/lib/api/visitas";


export const Route = createFileRoute("/promotor/roteiro")({
  component: Roteiro,
});

function Roteiro() {
  const { roteiros, loading: loadingRoteiros } = usePromotorRoteiros();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleStartVisita = async (roteiro: any) => {
    if (!profile?.empresa_id) return;
    
    try {
      setLoadingAction(roteiro.id);
      
      // 1. Check if a visit already exists for this roteiro
      const { data: existingVisita, error: fetchError } = await supabase
        .from('visitas')
        .select('id')
        .eq('roteiro_id', roteiro.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingVisita) {
        // Redirect to existing visit
        navigate({ to: `/promotor/visita/${roteiro.id}` as any });
        return;
      }

      // 2. Create new visit (upsert is used in saveVisita, but we'll use it to initialize)
      const payload = {
        roteiro_id: roteiro.id,
        promotor_id: roteiro.promotor_id,
        loja_id: roteiro.loja_id,
        inicio: new Date().toISOString(),
        status: 'em_andamento'
      };

      await saveVisita(payload, [], [], profile.empresa_id);
      
      // 3. Redirect to visit flow
      navigate({ to: `/promotor/visita/${roteiro.id}` as any });
    } catch (error: any) {
      console.error("Erro ao iniciar visita:", error);
      toast.error("Não foi possível iniciar a visita: " + error.message);
    } finally {
      setLoadingAction(null);
    }
  };

  if (loadingRoteiros) {

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
        
        {roteiros.map((parada) => (
          <Card key={parada.id} className={parada.status === 'concluida' ? "opacity-60" : ""}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-secondary p-3 rounded-full">
                  <MapPin size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{parada.lojas?.nome}</h3>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 font-medium text-primary/80">
                      <Briefcase size={14} />
                      {parada.industrias?.nome}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {parada.horario_previsto?.slice(0, 5) || "Sem horário"}
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant={roteiro.status === 'concluido' ? "outline" : "default"}
                disabled={loadingAction === roteiro.id}
                onClick={() => {
                  if (roteiro.status === 'concluido' || roteiro.status === 'em_andamento') {
                    navigate({ to: `/promotor/visita/${roteiro.id}` as any });
                  } else {
                    handleStartVisita(roteiro);
                  }
                }}
              >
                {loadingAction === roteiro.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : roteiro.status === 'concluido' ? (
                  "Ver Resumo"
                ) : roteiro.status === 'em_andamento' ? (
                  "Continuar"
                ) : (
                  "Iniciar"
                )}
                {loadingAction !== roteiro.id && <ArrowRight className="ml-2" size={14} />}
              </Button>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


