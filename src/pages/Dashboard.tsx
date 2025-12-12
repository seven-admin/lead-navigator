import { useLeads, useStatusOpcoes } from '@/hooks/useLeads';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Phone, Calendar, AlertCircle } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, isAdmin } = useAuthContext();
  const { data: leads, isLoading } = useLeads();
  const { data: statusOpcoes } = useStatusOpcoes();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalLeads = leads?.length || 0;
  
  const statusCounts = statusOpcoes?.map((status) => ({
    ...status,
    count: leads?.filter((l) => l.status_id === status.id).length || 0,
  })) || [];

  const leadsComTelefone = leads?.filter((l) => l.telefone_1).length || 0;
  const leadsAgendados = leads?.filter((l) => l.status_opcoes?.descricao === 'AGENDADO').length || 0;
  const leadsSemContato = leads?.filter((l) => l.status_opcoes?.descricao === 'SEM CONTATO').length || 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Olá, {user?.user_metadata?.nome || user?.email}
          {isAdmin && <span className="ml-2 text-primary">(Admin)</span>}
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Telefone</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadsComTelefone}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{leadsAgendados}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Contato</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{leadsSemContato}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusCounts.map((status) => {
              const percentage = totalLeads > 0 ? (status.count / totalLeads) * 100 : 0;
              
              return (
                <div key={status.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{status.descricao}</span>
                    <span className="font-medium">{status.count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}