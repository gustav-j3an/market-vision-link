import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ProductForm } from "@/components/gestor/ProductForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/gestor/produtos/")({
  component: Produtos,
});

function Produtos() {
  const { profile } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    if (!profile?.empresa_id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("empresa_id", profile.empresa_id)
        .order("nome");
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [profile?.empresa_id]);

  return (
    <>
      <PageHeader 
        title="Produtos" 
        description="Catálogo e indicadores de disponibilidade de SKU." 
      >
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum produto cadastrado</h3>
            <p className="text-muted-foreground mb-6">Comece adicionando os itens do seu catálogo.</p>
            <Button onClick={() => setIsFormOpen(true)}>Cadastrar Primeiro Produto</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {products.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold">{p.nome}</h3>
                    <p className="text-sm text-muted-foreground">{p.marca} • {p.categoria}</p>
                    <p className="text-xs text-muted-foreground mt-1">SKU: {p.sku || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProductForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={fetchProducts} 
      />
    </>
  );
}
