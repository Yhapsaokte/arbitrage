'use client';

import { KpiCard } from '@/components/kpi-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { computeAll, euro } from '@/lib/calculs/engine';
import { useSimulateurStore } from '@/lib/store/use-simulateur-store';
import Link from 'next/link';

export default function DashboardPage() {
  const { settings, params, scenarios } = useSimulateurStore();
  const results = computeAll(scenarios, settings, params);
  const best = [...results].sort((a, b) => b.result.scoreGlobal - a.result.scoreGlobal)[0];
  const avg = results.reduce((acc, r) => acc + r.result.scoreGlobal, 0) / Math.max(results.length, 1);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Dashboard dossier</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Résultat comptable provisoire" value={euro(settings.resultatProvisoire)} />
        <KpiCard title="IS estimé (scénario recommandé)" value={best ? euro(best.result.isEstime) : '-'} />
        <KpiCard title="Net estimé dirigeant" value={best ? euro(best.result.netDirigeant) : '-'} trend="positive" />
        <KpiCard title="Impact trésorerie" value={best ? euro(best.result.impactTresorerie) : '-'} trend={best && best.result.impactTresorerie < 0 ? 'negative' : 'neutral'} />
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium">Scénarios enregistrés</h3>
          <Link href="/scenarios"><Button>Créer un scénario</Button></Link>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500"><tr><th>Nom</th><th>Coût société</th><th>Net dirigeant</th><th>IS</th><th>Score</th></tr></thead>
          <tbody>
            {results.map(({ scenario, result }) => (
              <tr key={scenario.id} className="border-t">
                <td className="py-2">{scenario.nom}</td><td>{euro(result.coutTotalSociete)}</td><td>{euro(result.netDirigeant)}</td><td>{euro(result.isEstime)}</td><td>{result.scoreGlobal.toFixed(1)}/100</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-slate-500">Score moyen portefeuille : {avg.toFixed(1)} / 100</p>
      </Card>
    </div>
  );
}
