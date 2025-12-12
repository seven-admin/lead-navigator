import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  'SEM CONTATO': 'bg-gray-200 text-gray-700',
  'RETORNAR': 'bg-yellow-500 text-white',
  'TEM INTERESSE': 'bg-green-500 text-white',
  'AGENDADO': 'bg-blue-500 text-white',
  'CONTATO ERRADO': 'bg-red-500 text-white',
  'SEM INTERESSE': 'bg-gray-500 text-white',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusColors[status] || 'bg-gray-200 text-gray-700',
        className
      )}
    >
      {status}
    </span>
  );
}
