'use client';

import { Card } from '@/components/ui/card';
import { useSimulateurStore } from '@/lib/store/use-simulateur-store';

export default function AnnexesPage() {
  const { settings, params } = useSimulateurStore();
  return (
    <Card>
      <h2 className="mb-3 text-xl font-semibold">Annexes techniques</h2>
      <h3 className="font-medium">Données d’entrée</h3>
      <pre className="mt-2 overflow-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100">{JSON.stringify(settings, null, 2)}</pre>
      <h3 className="mt-4 font-medium">Hypothèses de calcul</h3>
      <pre className="mt-2 overflow-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100">{JSON.stringify(params, null, 2)}</pre>
      <p className="mt-3 text-sm text-slate-600">Logique pédagogique: coût total = brut + charges patronales; net = brut - charges salariales; IS par paliers; IR simplifié au quotient familial; score global pondéré modifiable.</p>
    </Card>
  );
}
