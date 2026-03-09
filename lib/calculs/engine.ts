import { CalcParameters, GeneralSettings, Scenario, ScenarioResult } from '@/lib/types';

export const euro = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

export const pct = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 }).format(v);

const calculateIS = (resultat: number, p: CalcParameters) => {
  if (resultat <= 0) return 0;
  const reduced = Math.min(resultat, p.isReducedCeiling) * p.isReducedRate;
  const normal = Math.max(0, resultat - p.isReducedCeiling) * p.isNormalRate;
  return reduced + normal;
};

const computeIR = (base: number, parts: number, p: CalcParameters) => {
  const taxablePerPart = Math.max(0, base / Math.max(parts, 1));
  const taxPerPart = p.irBrackets.reduce((acc, b) => {
    const span = Math.max(0, Math.min(taxablePerPart, b.to) - b.from);
    return acc + span * b.rate;
  }, 0);
  return taxPerPart * Math.max(parts, 1);
};

const netFromBrut = (brut: number, p: CalcParameters) => brut * (1 - p.employeeContribRate);
const brutFromNet = (net: number, p: CalcParameters) => net / Math.max(1 - p.employeeContribRate, 0.01);

const objectiveBoost = (score: number, objective: GeneralSettings['objectif'], res: ScenarioResult) => {
  switch (objective) {
    case 'max_net': return score + res.netDirigeant / 5000;
    case 'preserver_treso': return score + Math.max(0, res.impactTresorerie) / 10000;
    case 'reduire_is': return score + Math.max(0, -res.variationIS) / 500;
    case 'valider_trimestres': return score + res.trimestresValides * 2;
    default: return score;
  }
};

export function computeScenario(s: Scenario, gs: GeneralSettings, p: CalcParameters): ScenarioResult {
  const brutComp = s.modeSaisie === 'brut' ? s.remunerationComplementaire : brutFromNet(s.remunerationComplementaire, p);
  const chargesPat = brutComp * p.employerContribRate;
  const chargesSal = brutComp * p.employeeContribRate;
  const netComp = brutComp - chargesSal;
  const coutTotal = brutComp + chargesPat;
  const resultatApres = gs.resultatProvisoire - coutTotal;
  const isBase = calculateIS(gs.resultatProvisoire, p);
  const isNew = calculateIS(resultatApres, p);
  const variationIS = isNew - isBase;

  const baseIr = Math.max(0, (gs.remunerationDejaVersee + brutComp) * (1 - p.salaryIrAllowanceRate))
    + gs.salaireConjoint + gs.revenusLMNP + gs.autresRevenus;
  const ir = computeIR(baseIr, gs.partsFoyer, p) + gs.revenusLMNP * p.lmnpTaxRate;

  const trimestres = Math.min(p.quarterMax, Math.floor((gs.remunerationDejaVersee + brutComp) / p.quarterValidationThreshold));
  const impactTresorerie = gs.tresorerieDisponible - coutTotal - Math.max(0, isNew);

  const res: ScenarioResult = {
    scenarioId: s.id,
    resultatApresRemuneration: resultatApres,
    isEstime: isNew,
    variationIS,
    chargesSociales: chargesPat + chargesSal,
    coutTotalSociete: coutTotal,
    netDirigeant: netComp,
    irFoyer: ir,
    impactTresorerie,
    trimestresValides: trimestres,
    scoreGlobal: 0,
    pointsVigilance: [],
  };

  if (impactTresorerie < 0) res.pointsVigilance.push('Trésorerie négative post-opération.');
  if (trimestres < 4) res.pointsVigilance.push('Validation retraite incomplète.');
  if (res.resultatApresRemuneration < 0) res.pointsVigilance.push('Résultat comptable estimé négatif.');

  const w = p.scoreWeights;
  let score =
    (res.netDirigeant / 60000) * w.net +
    (1 - res.coutTotalSociete / Math.max(gs.resultatProvisoire, 1)) * w.cost +
    (1 - res.isEstime / Math.max(gs.resultatProvisoire, 1)) * w.is +
    (1 - res.irFoyer / 40000) * w.ir +
    (Math.max(res.impactTresorerie, 0) / Math.max(gs.tresorerieDisponible, 1)) * w.treasury +
    (res.trimestresValides / 4) * w.social;
  score = objectiveBoost(score, gs.objectif, res);
  res.scoreGlobal = Math.max(0, Math.min(100, score));

  return res;
}

export const computeAll = (scenarios: Scenario[], gs: GeneralSettings, p: CalcParameters) =>
  scenarios.map((s) => ({ scenario: s, result: computeScenario(s, gs, p) }));
