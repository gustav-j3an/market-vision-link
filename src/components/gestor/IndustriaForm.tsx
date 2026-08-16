
import React from "react";
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
import { createIndustria, updateIndustria, Industria } from "@/lib/api/industrias";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  marca: z.string().optional(),
  categoria: z.string().optional(),
  status: z.enum(["ativo", "inativo"]),
  contato: z.string().optional(),
});

interface IndustriaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  industria?: Industria | null;
}

export function IndustriaForm({ open, onOpenChange, onSuccess, industria }: IndustriaFormProps) {
  const { profile } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: industria?.nome || "",
      marca: industria?.marca || "",
      categoria: industria?.categoria || "",
      status: (industria?.status as any) || "ativo",
      contato: industria?.contato || "",
    },
  });

  React.useEffect(() => {
    if (industria) {
      form.reset({
        nome: industria.nome,
        marca: industria.marca || "",
        categoria: industria.categoria || "",
        status: (industria.status as any) || "ativo",
        contato: industria.contato || "",
      });
    } else {
      form.reset({
        nome: "",
        marca: "",
        categoria: "",
        status: "ativo",
        contato: "",
      });
    }
  }, [industria, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!profile?.empresa_id) return;
    
    try {
      if (industria) {
        await updateIndustria(industria.id, values as any);
        toast.success("Indústria atualizada com sucesso");
      } else {
        await createIndustria({
          ...values,
          empresa_id: profile.empresa_id,
        } as any);
        toast.success("Indústria cadastrada com sucesso");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar indústria:", error);
      toast.error("Não foi possível salvar a indústria");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{industria ? "Editar Indústria" : "Nova Indústria"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Indústria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Nestlé" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="marca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca Principal</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Ninho" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Alimentos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contato</FormLabel>
                  <FormControl>
                    <Input placeholder="E-mail ou Telefone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
