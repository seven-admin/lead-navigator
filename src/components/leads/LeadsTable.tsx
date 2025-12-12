import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from './StatusBadge';
import { LeadWithStatus } from '@/types/database';
import { Phone } from 'lucide-react';

interface LeadsTableProps {
  leads: LeadWithStatus[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
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
              <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <Link
                    to={`/leads/${lead.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {lead.nome}
                  </Link>
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
                <TableCell>
                  {lead.status_opcoes && (
                    <StatusBadge status={lead.status_opcoes.descricao} />
                  )}
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