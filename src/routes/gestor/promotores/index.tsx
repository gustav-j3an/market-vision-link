import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { PromoterForm } from "@/components/gestor/PromoterForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/gestor/promotores/")({
  component: Promotores,
});

function Promotores() {
  const { profile } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [promoters, setPromoters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPromoters = async () => {
    if (!profile?.empresa_id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("promotores")
        .select("*, profile:profiles(*)")
        .eq("empresa_id", profile.empresa_id);
      
      if (error) throw error;
      setPromoters(data || []);
    } catch (error) {
      console.error("Error fetching promoters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoters();
  }, [profile?.empresa_id]);

  return (
    <>
      <PageHeader 
        title="Promotores" 
        description="Equipe em campo e indicadores de performance."
        actions={
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo Promotor
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : promoters.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum promotor cadastrado</h3>
            <p className="text-muted-foreground mb-6">Adicione promotores para gerenciar seus roteiros.</p>
            <Button onClick={() => setIsFormOpen(true)}>Cadastrar Primeiro Promotor</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promoters.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-6 text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={p.profile?.foto_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.profile?.nome || p.id}`} />
                  <AvatarFallback>{p.profile?.nome?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-bold">{p.profile?.nome || "Sem Nome"}</h3>
                <p className="text-sm text-muted-foreground mb-4">{p.regiao || "Região não definida"}</p>
                
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground uppercase">E-mail</p>
                  <p className="text-sm font-medium">{p.profile?.email || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PromoterForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={fetchPromoters} 
      />
    </>
  );
}
