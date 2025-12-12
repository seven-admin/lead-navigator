import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useStatusOpcoes, useUpdateLead } from '@/hooks/useLeads';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatusBadge } from './StatusBadge';

interface StatusSelectProps {
  leadId: string;
  currentStatusId: number | null;
  currentStatusDescricao: string | null;
}

export function StatusSelect({ leadId, currentStatusId, currentStatusDescricao }: StatusSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: statusOpcoes } = useStatusOpcoes();
  const updateLead = useUpdateLead();

  const handleStatusChange = (newStatusId: number) => {
    if (newStatusId !== currentStatusId) {
      updateLead.mutate(
        { id: leadId, status_id: newStatusId },
        { onSuccess: () => setOpen(false) }
      );
    } else {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button className="focus:outline-none">
          {updateLead.isPending ? (
            <div className="flex items-center gap-1 px-2 py-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs text-muted-foreground">Salvando...</span>
            </div>
          ) : (
            <StatusBadge status={currentStatusDescricao || 'SEM STATUS'} />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-1">
          {statusOpcoes?.map((status) => (
            <button
              key={status.id}
              onClick={() => handleStatusChange(status.id)}
              className={`flex items-center gap-2 w-full px-2 py-1.5 text-left rounded hover:bg-muted transition-colors ${
                status.id === currentStatusId ? 'bg-muted' : ''
              }`}
            >
              <StatusBadge status={status.descricao} />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}