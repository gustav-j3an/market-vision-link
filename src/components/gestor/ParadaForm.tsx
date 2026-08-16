
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { createParadaRoteiro } from "@/lib/api/roteiros.semanais";

const formSchema = z.object({
  dia_semana: z.string(),
  loja_id: z.string().min(1, "Selecione uma loja"),
  industria_id: z.string().min(1, "Selecione uma indústria"),
  horario_previsto: z.string().optional(),
  ordem: z.string().transform(val => parseInt(val) || 1),
  observacao: z.string().optional(),
});

interface ParadaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  roteiroSemanalId: string;
  promotorId: string;
  semanaReferencia: string;
}

export function ParadaForm({ open, onOpenChange, onSuccess, roteiroSemanalId, promotorId, semanaReferencia }: ParadaFormProps) {
  const { profile } = useAuth();
  const [lojas, setLojas] = useState<any[]>([]);
  const [industrias, setIndustrias] = useState<any[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dia_semana: "1",
      loja_id: "",
      industria_id: "",
      horario_previsto: "08:00",
      ordem: 1,
      observacao: "",
    },
  });

  useEffect(() => {
    async function loadData() {
      if (!profile?.empresa_id) return;
      
      const [lojasRes, industRes] = await Promise.all([
        supabase.from('lojas').select('id, nome').eq('empresa_id', profile.empresa_id),
        supabase.from('industrias').select('id, nome').eq('empresa_id', profile.empresa_id).eq('status', 'ativo')
      ]);

      if (lojasRes.data) setLojas(lojasRes.data);
      if (industRes.data) setIndustrias(industRes.data);
    }
    if (open) loadData();
  }, [open, profile?.empresa_id]);

  const onSubmit = async (values: any) => {
    try {
      // Calculate date based on week reference and dia_semana
      const diaInt = parseInt(values.dia_semana);
      const baseDate = new Date(semanaReferencia);
      const targetDate = new Date(baseDate);
      targetDate.setDate(baseDate.getDate() + (diaInt - 1));
      
      await createParadaRoteiro({
        roteiro_semanal_id: roteiroSemanalId,
        promotor_id: promotorId,
        loja_id: values.loja_id,
        industria_id: values.industria_id,
        dia_semana: diaInt,
        data: targetDate.toISOString().split('T')[0]!,
        horario_previsto: values.horario_previsto,
        ordem: values.ordem,
        status: 'pendente',
        observacao: values.observacao || null
      });

      toast.success("Parada adicionada!");
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao adicionar parada");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Parada ao Roteiro</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="dia_semana"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia da Semana</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Segunda-feira</SelectItem>
                      <SelectItem value="2">Terça-feira</SelectItem>
                      <SelectItem value="3">Quarta-feira</SelectItem>
                      <SelectItem value="4">Quinta-feira</SelectItem>
                      <SelectItem value="5">Sexta-feira</SelectItem>
                      <SelectItem value="6">Sábado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="loja_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loja</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a loja" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lojas.map(loja => (
                        <SelectItem key={loja.id} value={loja.id}>{loja.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industria_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indústria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a indústria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industrias.map(ind => (
                        <SelectItem key={ind.id} value={ind.id}>{ind.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="horario_previsto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ordem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar Parada</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
