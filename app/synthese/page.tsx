'use client';

import { Card } from '@/components/ui/card';
import { computeAll, euro } from '@/lib/calculs/engine';
import { useSimulateurStore } from '@/lib/store/use-simulateur-store';

export default function SynthesePage() {
  const { settings, scenarios, params } = useSimulateurStore();
  const rows = computeAll(scenarios, settings, params);
  const best = [...rows].sort((a, b) => b.result.scoreGlobal - a.result.scoreGlobal)[0];

  return (
    <Card className="print:shadow-none">
      <h2 className="text-2xl font-semibold">Note de synthèse cabinet</h2>
      <p className="text-sm text-slate-600">{settings.raisonSociale} • Exercice {settings.exercice} • Clôture {settings.dateCloture}</p>
      <h3 className="mt-4 font-medium">Hypothèses retenues</h3>
      <ul className="list-disc pl-5 text-sm text-slate-700"><li>Simulation indicative paramétrable</li><li>Président assimilé salarié, SAS au 31/12</li><li>Intégration conjoint + LMNP + IR simplifié</li></ul>
      <h3 className="mt-4 font-medium">Comparatif scénarios</h3>
      <table className="w-full text-sm"><thead><tr><th className="text-left">Nom</th><th className="text-left">Net</th><th className="text-left">Coût</th><th className="text-left">Score</th></tr></thead><tbody>{rows.map(({ scenario, result }) => <tr key={scenario.id} className="border-t"><td className="py-1">{scenario.nom}</td><td>{euro(result.netDirigeant)}</td><td>{euro(result.coutTotalSociete)}</td><td>{result.scoreGlobal.toFixed(1)}</td></tr>)}</tbody></table>
      <h3 className="mt-4 font-medium">Scénario préconisé</h3>
      <p className="text-sm">{best?.scenario.nom} — net estimé {best ? euro(best.result.netDirigeant) : '-'}.</p>
      <h3 className="mt-4 font-medium">Limites & avertissement</h3>
      <p className="text-sm text-slate-700">Les résultats sont fournis à titre indicatif sur la base des hypothèses retenues et doivent être validés par un professionnel.</p>
    </Card>
  );
}
