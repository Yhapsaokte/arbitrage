import { evaluateScenario } from './simulation.js';

const range = (min, max, step) => {
  const arr = [];
  for (let v = min; v <= max; v += step) arr.push(v);
  return arr;
};

const objectiveValue = (s, objectif) => {
  switch (objectif) {
    case 'max_net':
      return s.netTotalFoyer;
    case 'tresorerie':
      return s.tresorerie.tresorerieFinale;
    case 'social':
      return s.retraite.trimestresValides * 20000 + s.netTotalFoyer;
    default:
      return (
        s.netTotalFoyer * 0.45 +
        s.tresorerie.tresorerieFinale * 0.35 +
        (4 - Math.abs(4 - s.retraite.trimestresValides)) * 5000 -
        s.payroll.chargesPatronales * 0.1
      );
  }
};

export const pickRecommendedOptions = (input) => {
  const remunerations = range(
    input.params.plancherRemuneration,
    input.params.plafondRemuneration,
    input.params.pasSimulation,
  );
  const ratios = [0, 0.25, 0.5, 0.75, 1];

  const tested = remunerations.flatMap((r) => ratios.map((d) => evaluateScenario(input, r, d)));
  const admissibles = tested.filter((x) => x.admissible);
  const pool = admissibles.length ? admissibles : tested;

  const scored = pool.map((s) => ({ ...s, _score: objectiveValue(s, input.objectif) }));
  const recommended = [...scored].sort((a, b) => b._score - a._score)[0];
  const prudente = [...pool].sort((a, b) => b.tresorerie.tresorerieFinale - a.tresorerie.tresorerieFinale)[0] || recommended;
  const maxNet = [...pool].sort((a, b) => b.netTotalFoyer - a.netTotalFoyer)[0] || recommended;

  const optimisationCurve = remunerations.map((r) => {
    const local = ratios.map((ratio) => evaluateScenario(input, r, ratio)).filter((x) => x.admissible);
    const best = local.length ? local.sort((a, b) => b.netTotalFoyer - a.netTotalFoyer)[0] : null;
    return { remuneration: r, net: best ? best.netTotalFoyer : 0 };
  });

  return {
    recommended,
    prudente,
    maxNet,
    testedCount: tested.length,
    admissibleCount: admissibles.length,
    optimisationCurve,
    hypotheses: [
      'Chaîne résultat séparée de la chaîne trésorerie (pas de mélange comptable/cash).',
      'Dividendes contraints par résultat distribuable ET trésorerie après rémunération + IS + réserve.',
      'IR foyer calculé via base imposable + quotient familial + barème paramétrable.',
      'Optimisation testée sur couples (rémunération, dividendes) : 0/25/50/75/100%.',
    ],
  };
};
