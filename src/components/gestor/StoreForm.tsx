import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StoreFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  store?: any;
}

export function StoreForm({ open, onOpenChange, onSuccess, store }: StoreFormProps) {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: store?.nome || "",
    rede: store?.rede || "",
    endereco: store?.endereco || "",
    cidade: store?.cidade || "",
    estado: store?.estado || "",
    regiao: store?.regiao || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.empresa_id) return;
    
    setIsLoading(true);
    try {
      if (store?.id) {
        const { error } = await supabase
          .from("lojas")
          .update(formData)
          .eq("id", store.id);
        if (error) throw error;
        toast.success("Loja atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("lojas")
          .insert({
            ...formData,
            empresa_id: profile.empresa_id,
          });
        if (error) throw error;
        toast.success("Loja cadastrada com sucesso!");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar loja");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{store ? "Editar Loja" : "Nova Loja"}</DialogTitle>
          <DialogDescription>Cadastre um novo ponto de venda para sua equipe atender.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Loja / Unidade</Label>
            <Input 
              id="nome" 
              value={formData.nome} 
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rede">Rede</Label>
            <Input 
              id="rede" 
              value={formData.rede} 
              onChange={(e) => setFormData({ ...formData, rede: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input 
              id="endereco" 
              value={formData.endereco} 
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input 
                id="cidade" 
                value={formData.cidade} 
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado (UF)</Label>
              <Input 
                id="estado" 
                maxLength={2}
                placeholder="SP"
                value={formData.estado} 
                onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
