import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  product?: any;
}

export function ProductForm({ open, onOpenChange, onSuccess, product }: ProductFormProps) {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: product?.nome || "",
    marca: product?.marca || "",
    categoria: product?.categoria || "",
    sku: product?.sku || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.empresa_id) return;
    
    setIsLoading(true);
    try {
      if (product?.id) {
        const { error } = await supabase
          .from("produtos")
          .update(formData)
          .eq("id", product.id);
        if (error) throw error;
        toast.success("Produto atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("produtos")
          .insert({
            ...formData,
            empresa_id: profile.empresa_id,
          });
        if (error) throw error;
        toast.success("Produto cadastrado com sucesso!");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar produto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          <DialogDescription>Preencha os dados do produto para o catálogo da sua empresa.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Produto</Label>
            <Input 
              id="nome" 
              value={formData.nome} 
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })} 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input 
                id="marca" 
                value={formData.marca} 
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Input 
                id="categoria" 
                value={formData.categoria} 
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input 
              id="sku" 
              value={formData.sku} 
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })} 
            />
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
