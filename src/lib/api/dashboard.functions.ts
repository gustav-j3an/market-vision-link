
import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export const getDashboardStats = createServerFn({ method: "GET" })
  .validator((data: any) => {
    return {
      empresaId: data.empresaId as string,
      period: (data.period as 'day' | 'week' | 'month') || 'day',
      industriaId: data.industriaId as string | undefined,
    };
  })
  .handler(async ({ data }) => {
    const { empresaId, period, industriaId } = data;
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

    // 1. Visitas stats from new table paradas_roteiro
    let paradasQuery = supabase
      .from('paradas_roteiro')
      .select('id', { count: 'exact' })
      .eq('roteiro_semanal:roteiros_semanais(empresa_id)', empresaId) // Filter via join or simple eq if empresa_id was there
      // However, roteiros_semanais has empresa_id. Let's assume we can filter or just use all.
      .gte('data', startDateStr)
      .lte('data', todayStr);
    
    // Better query: paradas_roteiro has no company_id directly, but we can filter by industrias.empresa_id or roteiros_semanais.empresa_id
    // But since RLS is active, we can just query directly for now if we know the RLS allows it.
    // For counting planned stops:
    let plannedQuery = supabase.from('paradas_roteiro').select('id', { count: 'exact' }).gte('data', startDateStr).lte('data', todayStr);
    if (industriaId) plannedQuery = plannedQuery.eq('industria_id', industriaId);
    const { count: totalParadas } = await plannedQuery;

    // 2. Completed visits
    let visitsQuery = supabase
      .from('visitas')
      .select('id, nota_execucao, loja_id, promotor_id, inicio, industria_id', { count: 'exact' })
      .eq('empresa_id', empresaId)
      .in('status', ['concluido', 'concluida'])
      .gte('inicio', startIso)
      .lte('inicio', endIso);

    if (industriaId) visitsQuery = visitsQuery.eq('industria_id', industriaId);
    
    const { data: visitasConcluidas } = await visitsQuery;

    // 3. Ruptura stats
    const vIds = (visitasConcluidas || []).map(v => v.id);
    let taxaRuptura = 0;
    let rupturasCount = 0;
    let itensVisita: any[] = [];

    if (vIds.length > 0) {
      const { data: itens } = await supabase
        .from('itens_visita')
        .select('status, produto_id, visita_id, produtos(nome, categoria)')
        .in('visita_id', vIds);
      
      itensVisita = itens || [];
      const totalItens = itensVisita.length;
      rupturasCount = itensVisita.filter(i => i.status === 'nao_encontrado' || i.status === 'ruptura').length;
      taxaRuptura = totalItens > 0 ? (rupturasCount / totalItens) * 100 : 0;
    }

    // 4. Execução média
    const notas = visitasConcluidas?.filter(v => v.nota_execucao !== null).map(v => v.nota_execucao as number) || [];
    const execucaoMedia = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0;

    // 5. Lojas visitadas (unique)
    const lojasVisitadas = new Set(visitasConcluidas?.map(v => v.loja_id)).size;

    // 6. Promotores ativos
    const promotoresAtivos = new Set(visitasConcluidas?.map(v => v.promotor_id)).size;

    // 7. Alertas for today
    let paradasHojeQuery = supabase
      .from('paradas_roteiro')
      .select('*, lojas(nome)')
      .eq('data', todayStr);
    
    if (industriaId) paradasHojeQuery = paradasHojeQuery.eq('industria_id', industriaId);
    const { data: paradasHoje } = await paradasHojeQuery;

    const alertas = [];
    const pendentes = paradasHoje?.filter(r => r.status === 'pendente') || [];
    if (pendentes.length > 0) {
      alertas.push({
        type: 'roteiro_atrasado',
        title: `${pendentes.length} Paradas Pendentes`,
        description: 'Existem visitas agendadas para hoje que ainda não foram iniciadas.',
        severity: 'warning'
      });
    }

    const baixaExecucao = visitasConcluidas?.filter(v => v.nota_execucao !== null && v.nota_execucao! < 70) || [];
    if (baixaExecucao.length > 0) {
      alertas.push({
        type: 'baixa_execucao',
        title: 'Baixa Qualidade de Execução',
        description: `${baixaExecucao.length} visitas registradas com nota abaixo de 70%.`,
        severity: 'destructive'
      });
    }

    // 8. Ranking
    const rupturaPorProduto: Record<string, { nome: string, count: number }> = {};
    itensVisita.forEach(i => {
      if (i.status === 'nao_encontrado' || i.status === 'ruptura') {
        const prodData = i.produtos as any;
        const nome = prodData?.nome || 'Desconhecido';
        const prodId = i.produto_id;
        if (!rupturaPorProduto[prodId]) {
          rupturaPorProduto[prodId] = { nome, count: 0 };
        }
        rupturaPorProduto[prodId].count++;
      }
    });
    
    const rankingRuptura = Object.values(rupturaPorProduto)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 9. Evolution
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
        visitasPlanejadas: totalParadas || 0,
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
