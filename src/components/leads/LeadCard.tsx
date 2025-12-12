import { Phone, MapPin, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusSelect } from './StatusSelect';
import { LeadWithStatus } from '@/types/database';

interface LeadCardProps {
  lead: LeadWithStatus;
  onOpenModal: (leadId: string) => void;
}

export function LeadCard({ lead, onOpenModal }: LeadCardProps) {
  const phoneCount = [
    lead.telefone_1,
    lead.telefone_2,
    lead.telefone_3,
    lead.telefone_4,
    lead.telefone_5,
  ].filter(Boolean).length;

  const address = [lead.cidade, lead.uf].filter(Boolean).join(' - ');

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
      onClick={() => onOpenModal(lead.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-foreground truncate flex-1">
            {lead.nome}
          </h3>
          <StatusSelect
            leadId={lead.id}
            currentStatusId={lead.status_id}
            currentStatusDescricao={lead.status_opcoes?.descricao || null}
          />
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          {address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{address}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0" />
            <span>
              {lead.telefone_1 || 'Sem telefone'}
              {phoneCount > 1 && (
                <span className="ml-1 text-primary">
                  (+{phoneCount - 1})
                </span>
              )}
            </span>
          </div>

          {lead.profiles && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {lead.profiles.nome || lead.profiles.email}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}