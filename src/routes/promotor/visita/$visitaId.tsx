
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Camera, Check, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { saveVisita } from "@/lib/api/visitas";

export const Route = createFileRoute("/promotor/visita/$visitaId" as any)({
  component: VisitaFlow,
});

type Step = 'check-in' | 'produtos' | 'fotos' | 'resumo';

function VisitaFlow() {
  const { visitaId } = useParams({ from: "/promotor/visita/$visitaId" as any }) as any;
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<Step>('check-in');
  const [roteiro, setRoteiro] = useState<any>(null);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [visitaData, setVisitaData] = useState({
    inicio: new Date().toISOString(),
    observacoes: '',
  });
  const [itens, setItens] = useState<any[]>([]);
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosPreviews, setFotosPreviews] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!profile?.empresa_id || !visitaId) return;
      try {
        setLoading(true);
        // Load roteiro
        const { data: roteiroData, error: roteiroError } = await supabase
          .from('roteiros')
          .select('*, lojas(*)')
          .eq('id', visitaId)
          .single();
        
        if (roteiroError) throw roteiroError;
        setRoteiro(roteiroData);

        // Load company products
        const { data: productsData, error: productsError } = await supabase
          .from('produtos')
          .select('*')
          .eq('empresa_id', profile.empresa_id);
        
        if (productsError) throw productsError;
        setProdutos(productsData);

        // Initial items state
        setItens(productsData.map(p => ({
          produto_id: p.id,
          status: 'em_estoque',
          preco: null,
          quantidade_estimada: null
        })));

      } catch (error) {
        console.error("Erro ao carregar dados da visita:", error);
        toast.error("Erro ao carregar visita");
        navigate({ to: "/promotor/roteiro" });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [visitaId, profile?.empresa_id]);

  const handleSave = async (isFinal = false) => {
    if (!profile?.empresa_id || !roteiro) return;
    
    try {
      setSaving(true);
      
      const payload = {
        roteiro_id: roteiro.id,
        promotor_id: roteiro.promotor_id,
        loja_id: roteiro.loja_id,
        inicio: visitaData.inicio,
        fim: isFinal ? new Date().toISOString() : null,
        observacoes: visitaData.observacoes,
        status: isFinal ? 'concluido' : 'em_andamento'
      };

      await saveVisita(payload, itens, fotos, profile.empresa_id);
      
      toast.success(isFinal ? "Visita finalizada com sucesso!" : "Progresso salvo!");
      if (isFinal) {
        navigate({ to: "/promotor/roteiro" });
      }
    } catch (error) {
      console.error("Erro ao salvar visita:", error);
      toast.error("Erro ao salvar dados");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFotos(prev => [...prev, ...newFiles]);
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFotosPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Preparando sua visita...</p>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/promotor/roteiro" })}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold truncate">{roteiro?.lojas?.nome}</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between mb-8 px-2">
        {['check-in', 'produtos', 'fotos', 'resumo'].map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-1">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
              step === s ? "bg-primary text-white" : 
              i < ['check-in', 'produtos', 'fotos', 'resumo'].indexOf(step) ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
            )}>
              {i < ['check-in', 'produtos', 'fotos', 'resumo'].indexOf(step) ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider">{s.replace('-', ' ')}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {step === 'check-in' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Check-in</h2>
              <div className="bg-secondary/30 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Endereço:</p>
                <p className="text-sm text-muted-foreground">{roteiro?.lojas?.endereco}, {roteiro?.lojas?.cidade} - {roteiro?.lojas?.estado}</p>
              </div>
              <div className="pt-4">
                <Button className="w-full py-8 text-lg" onClick={() => setStep('produtos')}>
                  Confirmar Chegada
                </Button>
              </div>
            </div>
          )}

          {step === 'produtos' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Pesquisa de Produtos</h2>
              {itens.map((item, idx) => {
                const prod = produtos.find(p => p.id === item.produto_id);
                return (
                  <div key={item.produto_id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{prod?.nome}</p>
                        <p className="text-xs text-muted-foreground">{prod?.marca} | {prod?.sku}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select 
                          value={item.status} 
                          onValueChange={(val) => {
                            const newItens = [...itens];
                            newItens[idx].status = val;
                            setItens(newItens);
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="em_estoque">Em estoque</SelectItem>
                            <SelectItem value="estoque_baixo">Baixo</SelectItem>
                            <SelectItem value="ruptura">Ruptura</SelectItem>
                            <SelectItem value="nao_encontrado">N/A</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Preço (R$)</Label>
                        <Input 
                          type="number" 
                          placeholder="0,00" 
                          className="h-9"
                          value={item.preco || ''}
                          onChange={(e) => {
                            const newItens = [...itens];
                            newItens[idx].preco = parseFloat(e.target.value);
                            setItens(newItens);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep('check-in')}>Voltar</Button>
                <Button className="flex-1" onClick={() => setStep('fotos')}>Continuar</Button>
              </div>
            </div>
          )}

          {step === 'fotos' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Evidências Fotográficas</h2>
              <div className="grid grid-cols-2 gap-4">
                {fotosPreviews.map((preview, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={preview} alt="Evidência" className="w-full h-full object-cover" />
                  </div>
                ))}
                <label className="aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Tirar Foto</span>
                  <input type="file" accept="image/*" className="hidden" multiple onChange={handlePhotoChange} />
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep('produtos')}>Voltar</Button>
                <Button className="flex-1" onClick={() => setStep('resumo')}>Revisar</Button>
              </div>
            </div>
          )}

          {step === 'resumo' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Resumo da Visita</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Observações Gerais</Label>
                  <Textarea 
                    placeholder="Algo relevante sobre a visita?"
                    value={visitaData.observacoes}
                    onChange={(e) => setVisitaData(prev => ({ ...prev, observacoes: e.target.value }))}
                  />
                </div>
                
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Resumo da Pesquisa:</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>Produtos verificados: {itens.length}</li>
                    <li>Fotos anexadas: {fotos.length}</li>
                    <li>Status final: {visitaData.observacoes ? 'Completo' : 'Básico'}</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button className="w-full" size="lg" disabled={saving} onClick={() => handleSave(true)}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Finalizar Visita
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep('fotos')}>Voltar</Button>
                  <Button variant="secondary" className="flex-1" disabled={saving} onClick={() => handleSave(false)}>
                    <Save className="mr-2 h-4 w-4" /> Salvar Rascunho
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
