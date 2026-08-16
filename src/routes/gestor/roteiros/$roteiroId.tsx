
import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Calendar, MapPin, Briefcase, Clock, ChevronLeft } from "lucide-react";
import { getParadasRoteiro, deleteParada } from "@/lib/api/roteiros.semanais";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ParadaForm } from "@/components/gestor/ParadaForm";

export const Route = createFileRoute("/gestor/roteiros/$roteiroId")({
  component: RoteiroDetalhesPage,
});

function RoteiroDetalhesPage() {
  const { roteiroId } = Route.useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [roteiro, setRoteiro] = useState<any>(null);
  const [paradas, setParadas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchData = async () => {
    if (!roteiroId) return;
    try {
      setLoading(true);
      const { data: roteiroData, error: rError } = await supabase
        .from('roteiros_semanais')
        .select('*, promotores(id, perfil:profiles(nome))')
        .eq('id', roteiroId)
        .single();
      
      if (rError) throw rError;
      setRoteiro(roteiroData);

      const paradasData = await getParadasRoteiro(roteiroId);
      setParadas(paradasData);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar dados do roteiro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [roteiroId]);

  const handleDeleteParada = async (id: string) => {
    if (!confirm("Excluir esta parada?")) return;
    try {
      await deleteParada(id);
      toast.success("Parada removida");
      fetchData();
    } catch (error) {
      toast.error("Erro ao remover parada");
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!roteiro) return <div className="p-8 text-center text-destructive">Roteiro não encontrado</div>;

  const start = startOfWeek(new Date(roteiro.semana_referencia), { weekStartsOn: 1 });
  
  const diasSemana = [
    { label: "Segunda", value: 1 },
    { label: "Terça", value: 2 },
    { label: "Quarta", value: 3 },
    { label: "Quinta", value: 4 },
    { label: "Sexta", value: 5 },
    { label: "Sábado", value: 6 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/gestor/roteiros" })}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <PageHeader 
          title={`Roteiro: ${roteiro.promotores?.perfil?.nome}`} 
          description={`Semana de ${format(start, "dd/MM/yyyy")}`}
          actions={
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Parada
            </Button>
          }
        />
      </div>

      <div className="grid gap-6">
        {diasSemana.map(dia => {
          const paradasDia = paradas.filter(p => p.dia_semana === dia.value);
          const dataDia = addDays(start, dia.value - 1);
          
          return (
            <Card key={dia.value}>
              <CardHeader className="bg-muted/30 py-3">
                <CardTitle className="text-sm font-bold flex justify-between items-center">
                  <span>{dia.label} - {format(dataDia, "dd/MM")}</span>
                  <span className="text-xs font-normal text-muted-foreground">{paradasDia.length} paradas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    {paradasDia.length === 0 ? (
                      <TableRow>
                        <TableCell className="text-center py-4 text-xs text-muted-foreground italic">
                          Nenhuma parada planejada
                        </TableCell>
                      </TableRow>
                    ) : (
                      paradasDia.map(parada => (
                        <TableRow key={parada.id}>
                          <TableCell className="w-20 font-medium">
                            <div className="flex items-center gap-1 text-xs">
                              <Clock className="h-3 w-3" />
                              {parada.horario_previsto?.slice(0, 5)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-primary" />
                                {parada.lojas?.nome}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {parada.industrias?.nome}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteParada(parada.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ParadaForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={fetchData}
        roteiroSemanalId={roteiroId!}
        promotorId={roteiro.promotor_id}
        semanaReferencia={roteiro.semana_referencia}
      />
    </div>
  );
}
