import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ConversionMetricsProps {
  total: number;
  interesse: number;
  agendado: number;
  perdas: number;
}

export function ConversionMetrics({ total, interesse, agendado, perdas }: ConversionMetricsProps) {
  const taxaInteresse = total > 0 ? (interesse / total) * 100 : 0;
  const taxaAgendamento = total > 0 ? (agendado / total) * 100 : 0;
  const taxaPerda = total > 0 ? (perdas / total) * 100 : 0;

  const metrics = [
    { label: 'Taxa de Interesse', value: taxaInteresse, color: 'bg-green-500' },
    { label: 'Taxa de Agendamento', value: taxaAgendamento, color: 'bg-blue-500' },
    { label: 'Taxa de Perda', value: taxaPerda, color: 'bg-red-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Conversão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{metric.label}</span>
              <span className="font-medium">{metric.value.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${metric.color} transition-all duration-500`}
                style={{ width: `${Math.min(metric.value, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
