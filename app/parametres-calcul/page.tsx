'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSimulateurStore } from '@/lib/store/use-simulateur-store';

export default function ParametresCalculPage() {
  const { params, setParams, resetParams } = useSimulateurStore();

  return (
    <Card>
      <h2 className="mb-4 text-xl font-semibold">Paramètres de calcul configurables</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          ['isReducedRate', 'Taux IS réduit'],
          ['isReducedCeiling', 'Plafond IS réduit'],
          ['isNormalRate', 'Taux IS normal'],
          ['employerContribRate', 'Charges patronales'],
          ['employeeContribRate', 'Charges salariales'],
          ['flatTaxRate', 'Flat tax'],
          ['lmnpTaxRate', 'Hypothèse LMNP'],
          ['quarterValidationThreshold', 'Seuil trimestre'],
        ].map(([key, label]) => (
          <label key={key} className="space-y-1 text-sm">
            <span>{label}</span>
            <Input type="number" step="0.01" value={String((params as any)[key])} onChange={(e) => setParams({ ...params, [key]: Number(e.target.value) })} />
          </label>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={resetParams} type="button" className="bg-slate-700">Réinitialiser les paramètres par défaut</Button>
      </div>
    </Card>
  );
}
