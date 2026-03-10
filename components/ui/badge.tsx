import { cn } from '@/lib/utils';

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const classes = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
  };
  return <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', classes[variant])}>{children}</span>;
}
