import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function KpiCard({ title, value, trend }: { title: string; value: string; trend?: 'positive' | 'negative' | 'neutral' }) {
  return (
    <Card>
      <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {trend && <div className="mt-2"><Badge variant={trend === 'positive' ? 'success' : trend === 'negative' ? 'danger' : 'default'}>{trend === 'positive' ? 'Favorable' : trend === 'negative' ? 'Vigilance' : 'Neutre'}</Badge></div>}
    </Card>
  );
}
