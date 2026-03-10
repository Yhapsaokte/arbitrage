'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSimulateurStore } from '@/lib/store/use-simulateur-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  raisonSociale: z.string().min(2),
  exercice: z.string(),
  activite: z.string(),
  dirigeant: z.string(),
  resultatProvisoire: z.coerce.number(),
  tresorerieDisponible: z.coerce.number(),
  remunerationDejaVersee: z.coerce.number(),
  salaireConjoint: z.coerce.number(),
  revenusLMNP: z.coerce.number(),
  partsFoyer: z.coerce.number().min(1),
  autresRevenus: z.coerce.number(),
});

export default function DossierPage() {
  const { settings, setSettings } = useSimulateurStore();
  const form = useForm({ resolver: zodResolver(schema), defaultValues: settings });

  return (
    <Card>
      <h2 className="mb-4 text-xl font-semibold">Dossier & paramètres généraux</h2>
      <form onSubmit={form.handleSubmit((values) => setSettings({ ...settings, ...values }))} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {Object.entries(form.watch()).map(([k, v]) => (
          typeof v === 'string' || typeof v === 'number' ? (
            <label key={k} className="space-y-1 text-sm"><span className="text-slate-600">{k}</span><Input type={typeof v === 'number' ? 'number' : 'text'} {...form.register(k as never)} /></label>
          ) : null
        ))}
        <div className="md:col-span-2"><Button type="submit">Enregistrer le dossier</Button></div>
      </form>
    </Card>
  );
}
