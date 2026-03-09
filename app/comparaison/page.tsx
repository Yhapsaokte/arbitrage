'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { computeAll, euro } from '@/lib/calculs/engine';
import { useSimulateurStore } from '@/lib/store/use-simulateur-store';

export default function ComparaisonPage() {
  const { scenarios, settings, params, selectRecommended } = useSimulateurStore();
  const data = computeAll(scenarios, settings, params);
  const bestId = [...data].sort((a, b) => b.result.scoreGlobal - a.result.scoreGlobal)[0]?.scenario.id;

  return (
    <Card>
      <h2 className="mb-4 text-xl font-semibold">Comparaison multi-scénarios</h2>
      <table className="w-full text-sm">
        <thead className="text-left text-slate-500"><tr><th>Scénario</th><th>Coût société</th><th>Net dirigeant</th><th>IS</th><th>IR foyer</th><th>Trésorerie</th><th>Social</th><th>Score</th><th></th></tr></thead>
        <tbody>
          {data.map(({ scenario, result }) => (
            <tr key={scenario.id} className="border-t">
              <td className="py-2">{scenario.nom} {scenario.id === bestId && <Badge variant="success">Meilleur</Badge>}</td>
              <td>{euro(result.coutTotalSociete)}</td><td>{euro(result.netDirigeant)}</td><td>{euro(result.isEstime)}</td><td>{euro(result.irFoyer)}</td><td>{euro(result.impactTresorerie)}</td><td>{result.trimestresValides}/4</td><td>{result.scoreGlobal.toFixed(1)}</td>
              <td><Button className="px-2 py-1 text-xs" onClick={() => selectRecommended(scenario.id)}>Recommander</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
