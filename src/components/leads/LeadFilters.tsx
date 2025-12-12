import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStatusOpcoes } from '@/hooks/useLeads';
import { cn } from '@/lib/utils';

interface LeadFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: number | undefined;
  onStatusFilterChange: (value: number | undefined) => void;
}

export function LeadFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: LeadFiltersProps) {
  const { data: statusOpcoes } = useStatusOpcoes();

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <Button
          variant={statusFilter === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusFilterChange(undefined)}
          className="shrink-0"
        >
          Todos
        </Button>
        {statusOpcoes?.map((status) => (
          <Button
            key={status.id}
            variant={statusFilter === status.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusFilterChange(status.id)}
            className="shrink-0"
          >
            {status.descricao}
          </Button>
        ))}
      </div>
    </div>
  );
}