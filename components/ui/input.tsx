import { cn } from '@/lib/utils';
import { InputHTMLAttributes } from 'react';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-primary/20 focus:ring', className)} {...props} />;
}
