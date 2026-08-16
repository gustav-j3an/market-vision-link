import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Package, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/gestor/produtos/")({
  component: Produtos,
});

function Produtos() {
  const produtos = [
    { id: 1, nome: "Suco RefrescaCo Laranja 1L", categoria: "Bebidas", ruptura: "5%", preco: "R$ 8,90" },
    { id: 2, nome: "Cerveja Artesanal Br 600ml", categoria: "Bebidas", ruptura: "18%", preco: "R$ 14,50" },
    { id: 3, nome: "Água Pura 500ml", categoria: "Bebidas", ruptura: "2%", preco: "R$ 2,50" },
  ];

  return (
    <>
      <PageHeader title="Produtos" description="Catálogo e indicadores de disponibilidade de SKU." />
      <div className="grid gap-6">
        {produtos.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="font-bold">{p.nome}</h3>
                  <p className="text-sm text-muted-foreground">{p.categoria}</p>
                </div>
              </div>
              <div className="flex gap-8 text-right">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Ruptura</p>
                  <p className={`font-bold ${parseFloat(p.ruptura) > 10 ? 'text-destructive' : 'text-success'}`}>
                    {p.ruptura}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Preço Médio</p>
                  <p className="font-bold">{p.preco}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
