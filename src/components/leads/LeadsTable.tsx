import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusSelect } from './StatusSelect';
import { AssigneeSelect } from './AssigneeSelect';
import { LeadWithStatus } from '@/types/database';
import { Phone, ArrowUp, ArrowDown } from 'lucide-react';
import { SortField, SortDirection } from '@/hooks/useLeads';
import { cn } from '@/lib/utils';

interface LeadsTableProps {
  leads: LeadWithStatus[];
  onOpenModal: (leadId: string) => void;
  isAdmin: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export function LeadsTable({ 
  leads, 
  onOpenModal, 
  isAdmin,
  sortField,
  sortDirection,
  onSort,
}: LeadsTableProps) {
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" /> 
      : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer select-none hover:bg-muted/50"
              onClick={() => onSort('nome')}
            >
              <div className="flex items-center gap-1">
                Nome
                <SortIndicator field="nome" />
              </div>
            </TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead 
              className="cursor-pointer select-none hover:bg-muted/50"
              onClick={() => onSort('status_id')}
            >
              <div className="flex items-center gap-1">
                Status
                <SortIndicator field="status_id" />
              </div>
            </TableHead>
            {isAdmin && (
              <TableHead>Atribuído a</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const phoneCount = [
              lead.telefone_1,
              lead.telefone_2,
              lead.telefone_3,
              lead.telefone_4,
              lead.telefone_5,
            ].filter(Boolean).length;

            return (
              <TableRow 
                key={lead.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onOpenModal(lead.id)}
              >
                <TableCell>
                  <span className="font-medium text-foreground hover:text-primary">
                    {lead.nome}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.cidade && lead.uf
                    ? `${lead.cidade} - ${lead.uf}`
                    : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.telefone_1 || '-'}</span>
                    {phoneCount > 1 && (
                      <span className="text-xs text-primary">
                        (+{phoneCount - 1})
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <StatusSelect
                    leadId={lead.id}
                    currentStatusId={lead.status_id}
                    currentStatusDescricao={lead.status_opcoes?.descricao || null}
                  />
                </TableCell>
                {isAdmin && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <AssigneeSelect
                      leadId={lead.id}
                      currentAssigneeId={lead.assigned_to}
                      currentAssigneeName={lead.profiles?.nome || lead.profiles?.email || null}
                    />
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
