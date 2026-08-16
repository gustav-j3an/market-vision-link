
import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createRoteiroSemanal } from "@/lib/api/roteiros.semanais";
import { startOfWeek, format, addWeeks } from "date-fns";
import { Loader2, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/gestor/roteiros/novo")({
  component: NovoRoteiroPage,
});

function NovoRoteiroPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [promotores, setPromotores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    promotor_id: "",
    semana_referencia: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
  });

  useEffect(() => {
    async function loadPromotores() {
      if (!profile?.empresa_id) return;
      const { data } = await supabase
        .from('promotores')
        .select('id, perfil:profiles(nome)')
        .eq('empresa_id', profile.empresa_id);
      if (data) setPromotores(data);
    }
    loadPromotores();
  }, [profile?.empresa_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.empresa_id || !formData.promotor_id) {
      toast.error("Selecione um promotor");
      return;
    }

    setLoading(true);
    try {
      const roteiro = await createRoteiroSemanal({
        empresa_id: profile.empresa_id,
        promotor_id: formData.promotor_id,
        semana_referencia: formData.semana_referencia,
        nome: null,
        status: 'rascunho'
      });

      toast.success("Roteiro semanal criado!");
      navigate({ to: `/gestor/roteiros/${roteiro.id}` as any });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar roteiro");
    } finally {
      setLoading(false);
    }
  };

  const semanas = [
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), 1),
    addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), 2),
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/gestor/roteiros" })}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <PageHeader 
          title="Novo Planejamento" 
          description="Crie um novo cronograma semanal para um promotor."
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Promotor</Label>
              <Select 
                onValueChange={(val) => setFormData({...formData, promotor_id: val})}
                value={formData.promotor_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o promotor" />
                </SelectTrigger>
                <SelectContent>
                  {promotores.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.perfil?.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Semana de Referência (Segunda-feira)</Label>
              <Select 
                onValueChange={(val) => setFormData({...formData, semana_referencia: val})}
                value={formData.semana_referencia}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {semanas.map(s => (
                    <SelectItem key={format(s, "yyyy-MM-dd")} value={format(s, "yyyy-MM-dd")}>
                      Semana de {format(s, "dd/MM/yyyy")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/gestor/roteiros" })}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar e Continuar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
