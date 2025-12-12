import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusSelect } from './StatusSelect';
import { LeadWithStatus } from '@/types/database';
import { Phone } from 'lucide-react';

interface LeadsTableProps {
  leads: LeadWithStatus[];
  onOpenModal: (leadId: string) => void;
}

export function LeadsTable({ leads, onOpenModal }: LeadsTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Atribuído a</TableHead>
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
                <TableCell className="text-muted-foreground">
                  {lead.profiles?.nome || lead.profiles?.email || '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}