'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { computeScenario, euro } from '@/lib/calculs/engine';
import { useSimulateurStore } from '@/lib/store/use-simulateur-store';
import { Scenario } from '@/lib/types';
import { useState } from 'react';

export default function ScenariosPage() {
  const { scenarios, addScenario, settings, params } = useSimulateurStore();
  const [draft, setDraft] = useState<Scenario>({ id: crypto.randomUUID(), nom: '', remunerationComplementaire: 0, modeSaisie: 'brut', primeExceptionnelle: false, commentaires: '', specificHypotheses: '' });

  const preview = computeScenario(draft, settings, params);

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-xl font-semibold">Créer / éditer un scénario</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input placeholder="Nom du scénario" value={draft.nom} onChange={(e) => setDraft({ ...draft, nom: e.target.value })} />
          <Input type="number" placeholder="Rémunération complémentaire" value={draft.remunerationComplementaire} onChange={(e) => setDraft({ ...draft, remunerationComplementaire: Number(e.target.value) })} />
          <Input placeholder="Commentaires cabinet" value={draft.commentaires} onChange={(e) => setDraft({ ...draft, commentaires: e.target.value })} />
          <Input placeholder="Hypothèses spécifiques" value={draft.specificHypotheses} onChange={(e) => setDraft({ ...draft, specificHypotheses: e.target.value })} />
        </div>
        <Button className="mt-3" onClick={() => { addScenario(draft); setDraft({ ...draft, id: crypto.randomUUID(), nom: '', remunerationComplementaire: 0 }); }}>Ajouter le scénario</Button>
      </Card>

      <Card>
        <h3 className="font-medium">Impacts estimés en direct</h3>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div>Résultat après rémunération: <b>{euro(preview.resultatApresRemuneration)}</b></div>
          <div>IS estimé: <b>{euro(preview.isEstime)}</b></div>
          <div>Coût total société: <b>{euro(preview.coutTotalSociete)}</b></div>
          <div>Net dirigeant: <b>{euro(preview.netDirigeant)}</b></div>
          <div>IR foyer: <b>{euro(preview.irFoyer)}</b></div>
          <div>Impact trésorerie: <b>{euro(preview.impactTresorerie)}</b></div>
          <div>Trimestres: <b>{preview.trimestresValides}/4</b></div>
          <div>Score global: <b>{preview.scoreGlobal.toFixed(1)}/100</b></div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 font-medium">Scénarios existants</h3>
        {scenarios.map((s) => <div key={s.id} className="border-t py-2 text-sm">{s.nom} — {euro(s.remunerationComplementaire)} ({s.modeSaisie})</div>)}
      </Card>
    </div>
  );
}
