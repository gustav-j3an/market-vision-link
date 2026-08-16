import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { invitePromoter, updatePromoterData } from "@/lib/api/promotores.functions";

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
    nome: "",
    email: "",
    regiao: "",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        nome: promoter?.profile?.nome || "",
        email: promoter?.profile?.email || "",
        regiao: promoter?.regiao || "",
      });
    }
  }, [open, promoter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.empresa_id) return;
    
    setIsLoading(true);
    try {
      if (promoter) {
        // Update existing promoter
        await updatePromoterData({
          data: {
            id: promoter.id,
            nome: formData.nome,
            regiao: formData.regiao,
          }
        });
        toast.success("Dados do promotor atualizados com sucesso!");
      } else {
        // Invite new promoter
        await invitePromoter({
          data: {
            nome: formData.nome,
            email: formData.email,
            regiao: formData.regiao,
            empresa_id: profile.empresa_id,
          }
        });
        toast.success("Convite enviado ao promotor com sucesso!");
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving promoter:", error);
      toast.error(error.message || "Erro ao salvar promotor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{promoter ? "Editar Promotor" : "Novo Promotor"}</DialogTitle>
          <DialogDescription>
            {promoter 
              ? "Atualize as informações do promotor." 
              : "Um convite será enviado por e-mail para que o promotor acesse o sistema."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input 
              id="nome" 
              value={formData.nome} 
              onChange={(e) => setFormData({...formData, nome: e.target.value})} 
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input 
              id="email" 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              disabled={!!promoter}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="regiao">Região de Atuação</Label>
            <Input 
              id="regiao" 
              value={formData.regiao} 
              onChange={(e) => setFormData({...formData, regiao: e.target.value})} 
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {promoter ? "Salvar Alterações" : "Enviar Convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

