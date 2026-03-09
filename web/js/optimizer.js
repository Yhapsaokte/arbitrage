import { simulateCombination } from './simulation.js';

const objectiveValue = (r, objectif) => {
  switch (objectif) {
    case 'max_net':
      return r.netFinal;
    case 'tresorerie':
      return r.tresorerieRestante + Math.min(r.netFinal, 20000);
    case 'social':
      return r.trimestresValides * 20000 + r.netFinal;
    default:
      return r.netFinal * 0.5 + r.tresorerieRestante * 0.35 + (4 - Math.abs(r.trimestresValides - 4)) * 5000 - r.irAdditionnelSimulation * 0.2;
  }
};

export const findBestArbitrage = (input) => {
  const results = [];
  const ratios = [0, 0.5, 1];
  const min = input.params.plancherRemuneration;
  const max = input.params.plafondRemuneration;
  const step = input.params.pasSimulation;

  for (let rem = min; rem <= max; rem += step) {
    ratios.forEach((ratio) => {
      const sim = simulateCombination(input, rem, ratio);
      results.push({ ...sim, ratioDividende: ratio, internalScore: objectiveValue(sim, input.objectif) });
    });
  }

  const admissibles = results.filter((r) => r.admissible);
  const pool = admissibles.length ? admissibles : results;
  const sorted = [...pool].sort((a, b) => b.internalScore - a.internalScore);

  const recommended = sorted[0];
  const prudente = [...pool]
    .filter((r) => r.tresorerieRestante >= input.params.seuilTresorerieResiduelle)
    .sort((a, b) => b.tresorerieRestante - a.tresorerieRestante)[0] || sorted[0];
  const maxNet = [...pool].sort((a, b) => b.netFinal - a.netFinal)[0] || sorted[0];

  return {
    recommended,
    prudente,
    maxNet,
    testedCount: results.length,
    admissibleCount: admissibles.length,
    hypotheses: [
      `Charges sociales estimatives : patronales ${Math.round(input.params.tauxPatronal * 100)} %, salariales ${Math.round(input.params.tauxSalarial * 100)} %`,
      `IS par paliers : ${Math.round(input.params.tauxISReduit * 100)} % jusqu’à ${input.params.plafondISReduit.toLocaleString('fr-FR')} €, puis ${Math.round(input.params.tauxISNormal * 100)} %`,
      `Dividendes : PFU indicatif ${Math.round(input.params.tauxPFU * 100)} %`,
      'IR foyer : estimation simplifiée avec quotient familial et barème paramétrable',
      'Retraite : calcul indicatif des trimestres validés',
    ],
  };
};
