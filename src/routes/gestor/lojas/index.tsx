import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Loader2, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { StoreForm } from "@/components/gestor/StoreForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/gestor/lojas/")({
  component: Lojas,
});

function Lojas() {
  const { profile } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStores = async () => {
    if (!profile?.empresa_id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("lojas")
        .select("*")
        .eq("empresa_id", profile.empresa_id)
        .order("nome");
      
      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [profile?.empresa_id]);

  return (
    <>
      <PageHeader title="Lojas" description="Gerencie as redes e unidades atendidas.">
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Loja
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : stores.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhuma loja cadastrada</h3>
            <p className="text-muted-foreground mb-6">Cadastre os pontos de venda que sua equipe visita.</p>
            <Button onClick={() => setIsFormOpen(true)}>Cadastrar Primeira Loja</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((loja) => (
            <Card key={loja.id} className="hover:border-primary transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="bg-primary/10 p-3 rounded-lg text-primary">
                    <ShoppingCart size={24} />
                  </div>
                  <Button variant="outline" size="sm">Ver Perfil</Button>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-bold">{loja.nome}</h3>
                  <p className="text-sm text-muted-foreground">{loja.rede || "Rede não informada"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{loja.cidade} - {loja.estado}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StoreForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={fetchStores} 
      />
    </>
  );
}
