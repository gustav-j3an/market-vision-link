import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { createRoteiro, updateRoteiro, Roteiro } from "@/lib/api/roteiros";
import { toast } from "sonner";
import { format } from "date-fns";

interface RoteiroFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  roteiro?: Roteiro | null;
}

export function RoteiroForm({ open, onOpenChange, onSuccess, roteiro }: RoteiroFormProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [promoters, setPromoters] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    promotor_id: "",
    loja_id: "",
    data_prevista: format(new Date(), "yyyy-MM-dd"),
    horario_previsto: "",
  });

  useEffect(() => {
    if (open && profile?.empresa_id) {
      fetchData();
      if (roteiro) {
        setFormData({
          promotor_id: roteiro.promotor_id,
          loja_id: roteiro.loja_id,
          data_prevista: roteiro.data_prevista,
          horario_previsto: roteiro.horario_previsto || "",
        });
      } else {
        setFormData({
          promotor_id: "",
          loja_id: "",
          data_prevista: format(new Date(), "yyyy-MM-dd"),
          horario_previsto: "",
        });
      }
    }
  }, [open, profile?.empresa_id, roteiro]);

  const fetchData = async () => {
    if (!profile?.empresa_id) return;
    try {
      const [promotersRes, storesRes] = await Promise.all([
        supabase
          .from("promotores")
          .select("*, profile:profiles(nome)")
          .eq("empresa_id", profile.empresa_id),
        supabase
          .from("lojas")
          .select("*")
          .eq("empresa_id", profile.empresa_id)
          .order("nome"),
      ]);

      if (promotersRes.error) throw promotersRes.error;
      if (storesRes.error) throw storesRes.error;

      setPromoters(promotersRes.data || []);
      setStores(storesRes.data || []);
    } catch (error) {
      console.error("Error fetching data for form:", error);
      toast.error("Erro ao carregar dados dos promotores e lojas");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.empresa_id) return;

    if (!formData.promotor_id || !formData.loja_id || !formData.data_prevista) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Validação de data/horário no passado
    const selectedDateTime = new Date(`${formData.data_prevista}T${formData.horario_previsto || "00:00"}`);
    if (selectedDateTime < new Date() && !roteiro) {
      toast.error("Não é possível agendar visitas no passado");
      return;
    }

    setLoading(true);
    try {
      if (roteiro) {
        await updateRoteiro(roteiro.id, {
          promotor_id: formData.promotor_id,
          loja_id: formData.loja_id,
          data_prevista: formData.data_prevista,
          horario_previsto: formData.horario_previsto || null,
        });
        toast.success("Roteiro atualizado com sucesso!");
      } else {
        await createRoteiro({
          ...formData,
          horario_previsto: formData.horario_previsto || null,
          empresa_id: profile.empresa_id,
        });
        toast.success("Roteiro criado com sucesso!");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar roteiro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{roteiro ? "Editar Roteiro" : "Novo Roteiro"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="promotor">Promotor *</Label>
            <Select 
              value={formData.promotor_id} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, promotor_id: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o promotor" />
              </SelectTrigger>
              <SelectContent>
                {promoters.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.profile?.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loja">Loja *</Label>
            <Select 
              value={formData.loja_id} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, loja_id: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a loja" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nome} ({s.rede || "Sem Rede"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data *</Label>
              <Input 
                id="data" 
                type="date" 
                value={formData.data_prevista}
                onChange={(e) => setFormData(prev => ({ ...prev, data_prevista: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horario">Horário Previsto</Label>
              <Input 
                id="horario" 
                type="time" 
                value={formData.horario_previsto}
                onChange={(e) => setFormData(prev => ({ ...prev, horario_previsto: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : roteiro ? "Salvar Alterações" : "Criar Roteiro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
