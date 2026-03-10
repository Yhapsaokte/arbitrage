'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  ['/', 'Dashboard'],
  ['/dossier', 'Dossier'],
  ['/parametres-calcul', 'Paramètres calcul'],
  ['/scenarios', 'Scénarios'],
  ['/comparaison', 'Comparaison'],
  ['/visualisations', 'Visualisations'],
  ['/synthese', 'Synthèse'],
  ['/annexes', 'Annexes'],
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] gap-6 p-6">
      <aside className="no-print w-64 rounded-2xl bg-white p-4 shadow-soft">
        <h1 className="mb-1 text-lg font-semibold">Arbitrage Rémunération SAS</h1>
        <p className="mb-4 text-xs text-slate-500">Outil cabinet - simulation indicative</p>
        <nav className="space-y-1">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className={`block rounded-lg px-3 py-2 text-sm ${pathname === href ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 space-y-4">
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Les résultats sont fournis à titre indicatif sur la base des hypothèses retenues et doivent être validés par un professionnel.
        </div>
        <div className="text-xs text-slate-500">Accueil / {links.find((l) => l[0] === pathname)?.[1] ?? 'Page'}</div>
        {children}
      </main>
    </div>
  );
}
