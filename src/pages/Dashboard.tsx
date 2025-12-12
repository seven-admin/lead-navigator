import { useMemo } from 'react';
import { useAllLeads, useStatusOpcoes } from '@/hooks/useLeads';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuthContext } from '@/contexts/AuthContext';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StatusPieChart } from '@/components/dashboard/StatusPieChart';
import { LeadsBarChart } from '@/components/dashboard/LeadsBarChart';
import { ConversionMetrics } from '@/components/dashboard/ConversionMetrics';
import { UserPerformanceChart } from '@/components/dashboard/UserPerformanceChart';
import { Users, Phone, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { format, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { user, isAdmin } = useAuthContext();
  const { data: leads, isLoading } = useAllLeads();
  const { data: statusOpcoes } = useStatusOpcoes();
  const { data: profiles } = useProfiles();

  const stats = useMemo(() => {
    if (!leads || !statusOpcoes) return null;

    const totalLeads = leads.length;
    const leadsComTelefone = leads.filter(l => l.telefone_1).length;
    const leadsAgendados = leads.filter(l => l.status_opcoes?.descricao === 'AGENDADO').length;
    const leadsInteresse = leads.filter(l => l.status_opcoes?.descricao === 'TEM INTERESSE').length;
    const leadsPerdas = leads.filter(l => 
      l.status_opcoes?.descricao === 'SEM INTERESSE' || 
      l.status_opcoes?.descricao === 'CONTATO ERRADO'
    ).length;

    const taxaConversao = totalLeads > 0 ? ((leadsAgendados / totalLeads) * 100).toFixed(1) : '0';

    // Status distribution for pie chart
    const statusData = statusOpcoes.map(status => ({
      name: status.descricao,
      value: leads.filter(l => l.status_id === status.id).length,
    }));

    // Monthly leads for bar chart (last 6 months)
    const now = new Date();
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(now, 5 - i);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM', { locale: ptBR });
      const count = leads.filter(l => {
        if (!l.created_at) return false;
        const leadDate = parseISO(l.created_at);
        return format(leadDate, 'yyyy-MM') === monthKey;
      }).length;
      return { month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1), leads: count };
    });

    // User performance (admin only)
    const userPerformance = profiles?.map(profile => {
      const userLeads = leads.filter(l => l.assigned_to === profile.id);
      const userAgendados = userLeads.filter(l => l.status_opcoes?.descricao === 'AGENDADO').length;
      return {
        name: profile.nome || profile.email || 'Sem nome',
        leads: userLeads.length,
        agendados: userAgendados,
      };
    }).filter(u => u.leads > 0).sort((a, b) => b.leads - a.leads).slice(0, 5) || [];

    return {
      totalLeads,
      leadsComTelefone,
      leadsAgendados,
      leadsInteresse,
      leadsPerdas,
      taxaConversao,
      statusData,
      monthlyData,
      userPerformance,
    };
  }, [leads, statusOpcoes, profiles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Olá, {user?.user_metadata?.nome || user?.email}
          {isAdmin && <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">Admin</span>}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Leads"
          value={stats?.totalLeads || 0}
          icon={Users}
        />
        <StatsCard
          title="Com Telefone"
          value={stats?.leadsComTelefone || 0}
          icon={Phone}
        />
        <StatsCard
          title="Agendados"
          value={stats?.leadsAgendados || 0}
          icon={Calendar}
        />
        <StatsCard
          title="Taxa de Conversão"
          value={`${stats?.taxaConversao || 0}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <StatusPieChart data={stats?.statusData || []} />
        <LeadsBarChart data={stats?.monthlyData || []} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ConversionMetrics
          total={stats?.totalLeads || 0}
          interesse={stats?.leadsInteresse || 0}
          agendado={stats?.leadsAgendados || 0}
          perdas={stats?.leadsPerdas || 0}
        />
        {isAdmin && (
          <UserPerformanceChart data={stats?.userPerformance || []} />
        )}
      </div>
    </div>
  );
}
