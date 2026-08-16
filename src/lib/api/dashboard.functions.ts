
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
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const todayStr = format(now, 'yyyy-MM-dd');

    // 1. Visitas stats
    const { data: totalRoteiros } = await supabase
      .from('roteiros')
      .select('id', { count: 'exact' })
      .eq('empresa_id', empresaId)
      .gte('data_prevista', startDateStr)
      .lte('data_prevista', todayStr);

    const { data: visitasConcluidas } = await supabase
      .from('visitas')
      .select('id, nota_execucao, loja_id, promotor_id, inicio', { count: 'exact' })
      .eq('empresa_id', empresaId)
      .eq('status', 'concluido')
      .gte('inicio', startIso)
      .lte('inicio', endIso);

    // 2. Ruptura stats
    const visitaIds = (visitasConcluidas || []).map(v => v.id);
    let taxaRuptura = 0;
    let rupturasCount = 0;
    let itensVisita: any[] = [];

    if (visitaIds.length > 0) {
      const { data: itens } = await supabase
        .from('itens_visita')
        .select('status, produto_id, visita_id, produtos(nome, categoria)')
        .in('visita_id', visitaIds);
      
      itensVisita = itens || [];
      const totalItens = itensVisita.length;
      rupturasCount = itensVisita.filter(i => i.status === 'nao_encontrado' || i.status === 'ruptura').length;
      taxaRuptura = totalItens > 0 ? (rupturasCount / totalItens) * 100 : 0;
    }

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
      .eq('data_prevista', todayStr);

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
    const baixaExecucao = visitasConcluidas?.filter(v => v.nota_execucao !== null && v.nota_execucao! < 70) || [];
    if (baixaExecucao.length > 0) {
      alertas.push({
        type: 'baixa_execucao',
        title: 'Baixa Qualidade de Execução',
        description: `${baixaExecucao.length} visitas registradas com nota abaixo de 70%.`,
        severity: 'destructive'
      });
    }

    // Ranking de produtos com mais ruptura
    const rupturaPorProduto: Record<string, { nome: string, count: number }> = {};
    itensVisita.forEach(i => {
      if (i.status === 'nao_encontrado' || i.status === 'ruptura') {
        const prodData = i.produtos as any;
        const nome = prodData?.nome || 'Desconhecido';
        if (!rupturaPorProduto[i.produto_id]) {
          rupturaPorProduto[i.produto_id] = { nome, count: 0 };
        }
        rupturaPorProduto[i.produto_id].count++;
      }
    });
    
    const rankingRuptura = Object.values(rupturaPorProduto)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Gráfico de evolução diária (últimos 7 dias)
    const evolucaoVisitas: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = format(subDays(now, i), 'dd/MM');
      evolucaoVisitas[d] = 0;
    }

    visitasConcluidas?.forEach(v => {
      const d = format(new Date(v.inicio), 'dd/MM');
      if (evolucaoVisitas[d] !== undefined) {
        evolucaoVisitas[d]++;
      }
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
      rankingRuptura,
      evolucao: Object.entries(evolucaoVisitas).map(([name, total]) => ({ name, total }))
    };
  });
