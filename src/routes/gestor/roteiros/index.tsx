import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Trash2, Calendar, ChevronRight } from "lucide-react";
import { getRoteirosSemanais } from "@/lib/api/roteiros.semanais";
import { toast } from "sonner";
import { format, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/gestor/roteiros/")({
  component: RoteirosPage,
});

function RoteirosPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [roteiros, setRoteiros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRoteiros = async () => {
    if (!profile?.empresa_id) return;
    try {
      setLoading(true);
      const data = await getRoteirosSemanais(profile.empresa_id);
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

  const filteredRoteiros = roteiros.filter(r => 
    r.promotores?.perfil?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Planejamento Semanal" 
        description="Gerencie as rotas e paradas semanais da sua equipe de campo."
        actions={
          <Button onClick={() => navigate({ to: "/gestor/roteiros/novo" as any })}>
            <Plus className="mr-2 h-4 w-4" /> Novo Planejamento
          </Button>
        }
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por promotor..."
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
              <TableHead>Semana</TableHead>
              <TableHead>Promotor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Carregando roteiros...
                </TableCell>
              </TableRow>
            ) : filteredRoteiros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhum planejamento semanal encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredRoteiros.map((roteiro) => {
                const start = startOfWeek(new Date(roteiro.semana_referencia), { weekStartsOn: 1 });
                const end = addDays(start, 5);
                return (
                  <TableRow key={roteiro.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate({ to: `/gestor/roteiros/${roteiro.id}` as any })}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(start, "dd/MM")} - {format(end, "dd/MM/yyyy")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{roteiro.promotores?.perfil?.nome}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                        roteiro.status === 'publicado' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      )}>
                        {roteiro.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Ver Detalhes <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}



