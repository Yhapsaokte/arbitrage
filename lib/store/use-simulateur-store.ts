'use client';

import { demoScenarios, demoSettings, defaultParameters } from '@/lib/data/defaults';
import { CalcParameters, GeneralSettings, Scenario } from '@/lib/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SimulateurState {
  settings: GeneralSettings;
  params: CalcParameters;
  scenarios: Scenario[];
  setSettings: (s: GeneralSettings) => void;
  setParams: (p: CalcParameters) => void;
  resetParams: () => void;
  addScenario: (s: Scenario) => void;
  updateScenario: (s: Scenario) => void;
  selectRecommended: (id: string) => void;
}

export const useSimulateurStore = create<SimulateurState>()(
  persist(
    (set) => ({
      settings: demoSettings,
      params: defaultParameters,
      scenarios: demoScenarios,
      setSettings: (settings) => set({ settings }),
      setParams: (params) => set({ params }),
      resetParams: () => set({ params: defaultParameters }),
      addScenario: (scenario) => set((state) => ({ scenarios: [...state.scenarios, scenario] })),
      updateScenario: (scenario) =>
        set((state) => ({ scenarios: state.scenarios.map((s) => (s.id === scenario.id ? scenario : s)) })),
      selectRecommended: (id) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) => ({ ...s, commentaires: s.id === id ? `${s.commentaires} (Recommandé)` : s.commentaires.replace(' (Recommandé)', '') })),
        })),
    }),
    { name: 'arbitrage-sas-store-v1' },
  ),
);
