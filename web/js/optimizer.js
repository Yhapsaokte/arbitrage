import { evaluateScenario } from './simulation.js';

const range = (min, max, step) => {
  const arr = [];
  for (let v = min; v <= max; v += step) arr.push(v);
  return arr;
};

const dividendRatios = (levels) => {
  const n = Math.max(2, Math.min(9, Math.round(levels)));
  return Array.from({ length: n }, (_, i) => i / (n - 1));
};

const scoreScenario = (s, objectif) => {
  switch (objectif) {
    case 'max_net':
      return s.netTotalFoyer;
    case 'tresorerie':
      return s.tresorerieRestante * 0.75 + s.netTotalFoyer * 0.25;
    case 'social':
      return s.retraite.trimestresValides * 25000 + s.netTotalFoyer - s.householdTax.irAdditionnel * 0.2;
    default:
      return s.netTotalFoyer * 0.45 + s.tresorerieRestante * 0.3 + (4 - Math.abs(4 - s.retraite.trimestresValides)) * 5000 - s.householdTax.irAdditionnel * 0.15;
  }
};

export const pickRecommendedOptions = (input) => {
  const remunerations = range(input.params.plancherRemuneration, input.params.plafondRemuneration, input.params.pasSimulation);
  const ratios = dividendRatios(input.params.niveauxDividendes);

  const tested = remunerations.flatMap((r) => ratios.map((d) => evaluateScenario(input, r, d)));
  const admissibles = tested.filter((x) => x.admissible);
  const pool = admissibles.length ? admissibles : tested;

  const scored = pool.map((s) => ({ ...s, _score: scoreScenario(s, input.objectif) }));
  const recommended = [...scored].sort((a, b) => b._score - a._score)[0];
  const prudente = [...pool].sort((a, b) => b.tresorerieRestante - a.tresorerieRestante)[0] || recommended;
  const maxNet = [...pool].sort((a, b) => b.netTotalFoyer - a.netTotalFoyer)[0] || recommended;

  const optimisationCurve = remunerations.map((r) => {
    const local = ratios.map((ratio) => evaluateScenario(input, r, ratio)).filter((x) => x.admissible);
    const best = local.length ? local.sort((a, b) => b.netTotalFoyer - a.netTotalFoyer)[0] : null;
    return { remuneration: r, net: best ? best.netTotalFoyer : 0, isOptimal: best && recommended.remunerationBrute === r };
  });

  return {
    recommended,
    prudente,
    maxNet,
    testedCount: tested.length,
    admissibleCount: admissibles.length,
    optimisationCurve,
    hypotheses: [
      `Simulation multi-niveaux dividendes: ${ratios.map((r) => `${Math.round(r * 100)}%`).join(', ')}`,
      `Réserve minimale de trésorerie: ${input.societe.reserveSecurite.toLocaleString('fr-FR')} € (contrainte stricte d’admissibilité)`,
      'Le dividende ne réduit pas l’IS et ne valide pas de trimestres retraite.',
      'Barème IR et paramètres sociaux/fiscaux entièrement modifiables dans l’onglet Paramètres.',
    ],
  };
};
