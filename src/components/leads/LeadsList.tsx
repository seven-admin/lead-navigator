import { useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { LeadCard } from './LeadCard';
import { LeadFilters } from './LeadFilters';
import { LeadsTable } from './LeadsTable';
import { Loader2, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function LeadsList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>();
  const isMobile = useIsMobile();

  const { data: leads, isLoading, error } = useLeads(statusFilter, search);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Erro ao carregar leads: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LeadFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {leads?.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum lead encontrado</p>
        </div>
      ) : isMobile ? (
        <div className="grid gap-3">
          {leads?.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      ) : (
        <LeadsTable leads={leads || []} />
      )}
    </div>
  );
}