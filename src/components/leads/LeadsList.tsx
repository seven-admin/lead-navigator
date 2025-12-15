import { useState, useEffect } from 'react';
import { useLeads, SortField, SortDirection } from '@/hooks/useLeads';
import { useAuth } from '@/hooks/useAuth';
import { LeadCard } from './LeadCard';
import { LeadFilters } from './LeadFilters';
import { LeadsTable } from './LeadsTable';
import { LeadDetailModal } from './LeadDetailModal';
import { CreateLeadModal } from './CreateLeadModal';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const PAGE_SIZE = 20;

export function LeadsList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const isMobile = useIsMobile();
  const { isAdmin } = useAuth();

  const { data, isLoading, error } = useLeads(
    statusFilter, 
    search, 
    page, 
    PAGE_SIZE,
    sortField,
    sortDirection
  );

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortField, sortDirection]);

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  const handleOpenModal = (leadId: string) => {
    setSelectedLeadId(leadId);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => setPage(i)} 
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => setPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

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

  const leads = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <LeadFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
        <Button onClick={() => setShowCreateModal(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum lead encontrado</p>
        </div>
      ) : isMobile ? (
        <div className="grid gap-3">
          {leads.map((lead) => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onOpenModal={handleOpenModal}
            />
          ))}
        </div>
      ) : (
        <LeadsTable 
          leads={leads} 
          onOpenModal={handleOpenModal}
          isAdmin={isAdmin}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-2 pt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, data?.totalCount || 0)} de {data?.totalCount || 0} leads
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Lead Detail Modal */}
      <LeadDetailModal
        leadId={selectedLeadId}
        open={!!selectedLeadId}
        onOpenChange={(open) => !open && setSelectedLeadId(null)}
      />

      {/* Create Lead Modal */}
      <CreateLeadModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
}
