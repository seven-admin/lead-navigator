import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  'SEM CONTATO': 'bg-muted text-muted-foreground',
  'RETORNAR': 'bg-warning/20 text-warning-foreground border border-warning',
  'TEM INTERESSE': 'bg-success/20 text-success border border-success',
  'AGENDADO': 'bg-primary/20 text-primary border border-primary',
  'CONTATO ERRADO': 'bg-destructive/20 text-destructive border border-destructive',
  'SEM INTERESSE': 'bg-muted text-muted-foreground',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusColors[status] || 'bg-muted text-muted-foreground',
        className
      )}
    >
      {status}
    </span>
  );
}