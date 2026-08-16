
import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Briefcase, MoreHorizontal } from "lucide-react";
import { getIndustrias, Industria } from "@/lib/api/industrias";
import { toast } from "sonner";
import { IndustriaForm } from "@/components/gestor/IndustriaForm";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/gestor/industrias/")({
  component: IndustriasPage,
});

function IndustriasPage() {
  const { profile } = useAuth();
  const [industrias, setIndustrias] = useState<Industria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndustria, setEditingIndustria] = useState<Industria | null>(null);

  const fetchIndustrias = async () => {
    if (!profile?.empresa_id) return;
    try {
      setLoading(true);
      const data = await getIndustrias(profile.empresa_id);
      setIndustrias(data);
    } catch (error) {
      console.error("Erro ao carregar indústrias:", error);
      toast.error("Não foi possível carregar as indústrias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndustrias();
  }, [profile?.empresa_id]);

  const filteredIndustrias = industrias.filter(i => 
    i.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.marca?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Indústrias" 
        description="Gerencie as indústrias e clientes atendidos pela sua operação."
        actions={
          <Button onClick={() => {
            setEditingIndustria(null);
            setIsFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Nova Indústria
          </Button>
        }
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou marca..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Indústria</TableHead>
              <TableHead>Marca Principal</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Carregando indústrias...
                </TableCell>
              </TableRow>
            ) : filteredIndustrias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma indústria encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredIndustrias.map((industria) => (
                <TableRow key={industria.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <Briefcase size={16} />
                      </div>
                      {industria.nome}
                    </div>
                  </TableCell>
                  <TableCell>{industria.marca || "--"}</TableCell>
                  <TableCell>{industria.categoria || "--"}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                      industria.status === 'ativo' ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
                    )}>
                      {industria.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingIndustria(industria);
                          setIsFormOpen(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <IndustriaForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={fetchIndustrias}
        industria={editingIndustria}
      />
    </div>
  );
}
