
import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export const getDashboardStats = createServerFn({ method: "GET" })
  .validator((data: any) => {
    return {
      empresaId: data.empresaId as string,
      period: (data.period as 'day' | 'week' | 'month') || 'day',
    };
  })
  .handler(async ({ data }) => {
    const { empresaId, period } = data;
    const now = new Date();
    let startDate: Date;

    if (period === 'day') {
      startDate = startOfDay(now);
    } else if (period === 'week') {
      startDate = subDays(now, 7);
    } else {
      startDate = subDays(now, 30);
    }

    const startIso = startDate.toISOString();
    const endIso = endOfDay(now).toISOString();

    // 1. Visitas stats
    const { data: totalRoteiros } = await supabase
      .from('roteiros')
      .select('id', { count: 'exact' })
      .eq('empresa_id', empresaId)
      .gte('data_prevista', startIso.split('T')[0])
      .lte('data_prevista', endIso.split('T')[0]);

    const { data: visitasConcluidas } = await supabase
      .from('visitas')
      .select('id, nota_execucao, loja_id, promotor_id', { count: 'exact' })
      .eq('empresa_id', empresaId)
      .eq('status', 'concluido')
      .gte('inicio', startIso)
      .lte('inicio', endIso);

    // 2. Ruptura stats
    const { data: itensVisita } = await supabase
      .from('itens_visita')
      .select('status, produto_id, visita_id')
      .in('visita_id', (visitasConcluidas || []).map(v => v.id));

    const totalItens = itensVisita?.length || 0;
    const rupturas = itensVisita?.filter(i => i.status === 'ruptura').length || 0;
    const taxaRuptura = totalItens > 0 ? (rupturas / totalItens) * 100 : 0;

    // 3. Execução média
    const notas = visitasConcluidas?.filter(v => v.nota_execucao !== null).map(v => v.nota_execucao as number) || [];
    const execucaoMedia = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0;

    // 4. Lojas visitadas (unique)
    const lojasVisitadas = new Set(visitasConcluidas?.map(v => v.loja_id)).size;

    // 5. Promotores ativos
    const promotoresAtivos = new Set(visitasConcluidas?.map(v => v.promotor_id)).size;

    // 6. Alertas
    const { data: roteirosHoje } = await supabase
      .from('roteiros')
      .select('*, lojas(nome)')
      .eq('empresa_id', empresaId)
      .eq('data_prevista', format(now, 'yyyy-MM-dd'));

    const alertas = [];
    
    // Alerta de roteiros pendentes
    const pendentes = roteirosHoje?.filter(r => r.status === 'pendente') || [];
    if (pendentes.length > 0) {
      alertas.push({
        type: 'roteiro_atrasado',
        title: `${pendentes.length} Roteiros Pendentes`,
        description: 'Existem roteiros para hoje que ainda não foram iniciados.',
        severity: 'warning'
      });
    }

    // Alerta de baixa execução
    const baixaExecucao = visitasConcluidas?.filter(v => v.nota_execucao !== null && v.nota_execucao! < 7) || [];
    if (baixaExecucao.length > 0) {
      alertas.push({
        type: 'baixa_execucao',
        title: 'Baixa Qualidade de Execução',
        description: `${baixaExecucao.length} visitas registradas com nota abaixo de 7.`,
        severity: 'destructive'
      });
    }

    // Ranking de rupturas por produto
    const rupturaPorProduto: Record<string, number> = {};
    itensVisita?.filter(i => i.status === 'ruptura').forEach(i => {
      rupturaPorProduto[i.produto_id] = (rupturaPorProduto[i.produto_id] || 0) + 1;
    });

    return {
      stats: {
        visitasRealizadas: visitasConcluidas?.length || 0,
        visitasPlanejadas: totalRoteiros?.length || 0,
        taxaRuptura: taxaRuptura.toFixed(1) + '%',
        execucaoMedia: execucaoMedia.toFixed(1) + '%',
        lojasVisitadas,
        promotoresAtivos
      },
      alertas,
      rupturas
    };
  });
