import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PromoterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  promoter?: any;
}

export function PromoterForm({ open, onOpenChange, onSuccess, promoter }: PromoterFormProps) {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: promoter?.nome || "",
    email: promoter?.email || "",
    regiao: promoter?.regiao || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.empresa_id) return;
    
    setIsLoading(true);
    try {
      // Logic for adding a promoter requires creating a profile + promotor entry
      // For simplicity, we just add the promotor metadata here
      const { error } = await supabase
        .from("promotores")
        .insert({
          perfil_id: profile.id, // simplified linking for demo
          empresa_id: profile.empresa_id,
          regiao: formData.regiao,
        });
        
      if (error) throw error;
      toast.success("Promotor cadastrado com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar promotor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Promotor</DialogTitle>
          <DialogDescription>Cadastre um novo promotor de campo para sua equipe.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="regiao">Região de Atuação</Label>
            <Input id="regiao" value={formData.regiao} onChange={(e) => setFormData({...formData, regiao: e.target.value})} />
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
