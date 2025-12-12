import { useState } from 'react';
import { Check, ChevronsUpDown, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useProfiles } from '@/hooks/useProfiles';
import { useUpdateLead } from '@/hooks/useLeads';

interface AssigneeSelectProps {
  leadId: string;
  currentAssigneeId: string | null;
  currentAssigneeName: string | null;
}

export function AssigneeSelect({
  leadId,
  currentAssigneeId,
  currentAssigneeName,
}: AssigneeSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: profiles } = useProfiles();
  const updateLead = useUpdateLead();

  const handleSelect = (userId: string | null) => {
    if (userId !== currentAssigneeId) {
      updateLead.mutate({ id: leadId, assigned_to: userId });
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 justify-start gap-2 px-2 font-normal"
          onClick={(e) => e.stopPropagation()}
        >
          <UserCircle className="h-4 w-4 text-muted-foreground" />
          <span className="truncate max-w-[120px]">
            {currentAssigneeName || 'Não atribuído'}
          </span>
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[200px] p-0" 
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[300px] overflow-y-auto">
          <button
            className={cn(
              'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted',
              !currentAssigneeId && 'bg-muted'
            )}
            onClick={() => handleSelect(null)}
          >
            <Check
              className={cn(
                'h-4 w-4',
                !currentAssigneeId ? 'opacity-100' : 'opacity-0'
              )}
            />
            <span className="text-muted-foreground italic">Não atribuído</span>
          </button>
          {profiles?.map((profile) => (
            <button
              key={profile.id}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted',
                currentAssigneeId === profile.id && 'bg-muted'
              )}
              onClick={() => handleSelect(profile.id)}
            >
              <Check
                className={cn(
                  'h-4 w-4',
                  currentAssigneeId === profile.id ? 'opacity-100' : 'opacity-0'
                )}
              />
              <span className="truncate">{profile.nome || profile.email}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
