import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import { getRoteiros, deleteRoteiro, Roteiro } from "@/lib/api/roteiros";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RoteiroForm } from "@/components/gestor/RoteiroForm";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gestor/roteiros/")({
  component: RoteirosPage,
});

function RoteirosPage() {
  const { profile } = useAuth();
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoteiro, setEditingRoteiro] = useState<Roteiro | null>(null);

  const fetchRoteiros = async () => {
    if (!profile?.empresa_id) return;
    try {
      setLoading(true);
      const data = await getRoteiros(profile.empresa_id);
      setRoteiros(data);
    } catch (error) {
      console.error("Erro ao carregar roteiros:", error);
      toast.error("Não foi possível carregar os roteiros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoteiros();
  }, [profile?.empresa_id]);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este roteiro?")) return;
    try {
      await deleteRoteiro(id);
      toast.success("Roteiro excluído com sucesso");
      fetchRoteiros();
    } catch (error) {
      toast.error("Erro ao excluir roteiro");
    }
  };

  const filteredRoteiros = roteiros.filter(r => 
    r.promotor?.perfil?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.loja?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Roteiros" 
        description="Planeje e acompanhe as visitas dos promotores."
        actions={
          <Button onClick={() => {
            setEditingRoteiro(null);
            setIsFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Novo Roteiro
          </Button>
        }
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por promotor ou loja..."
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
              <TableHead>Data</TableHead>
              <TableHead>Promotor</TableHead>
              <TableHead>Loja</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando roteiros...
                </TableCell>
              </TableRow>
            ) : filteredRoteiros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum roteiro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredRoteiros.map((roteiro) => (
                <TableRow key={roteiro.id}>
                  <TableCell>
                    {format(new Date(roteiro.data_prevista), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-medium">{roteiro.promotor?.perfil?.nome}</TableCell>
                  <TableCell>{roteiro.loja?.nome}</TableCell>
                  <TableCell>{roteiro.horario_previsto || "--:--"}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                      roteiro.status === 'concluido' ? "bg-green-100 text-green-800" :
                      roteiro.status === 'em_andamento' ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    )}>
                      {roteiro.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingRoteiro(roteiro);
                        setIsFormOpen(true);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(roteiro.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      <RoteiroForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={fetchRoteiros}
        roteiro={editingRoteiro}
      />
    </div>
  );
}


