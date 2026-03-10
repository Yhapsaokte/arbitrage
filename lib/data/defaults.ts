import { CalcParameters, GeneralSettings, Scenario } from '@/lib/types';

export const defaultParameters: CalcParameters = {
  referenceYear: 2026,
  isReducedRate: 0.15,
  isReducedCeiling: 42500,
  isNormalRate: 0.25,
  employerContribRate: 0.42,
  employeeContribRate: 0.22,
  salaryIrAllowanceRate: 0.1,
  flatTaxRate: 0.3,
  lmnpTaxRate: 0.17,
  quarterValidationThreshold: 1800,
  quarterMax: 4,
  irBrackets: [
    { from: 0, to: 11497, rate: 0 },
    { from: 11498, to: 29315, rate: 0.11 },
    { from: 29316, to: 83823, rate: 0.3 },
    { from: 83824, to: 180294, rate: 0.41 },
    { from: 180295, to: Number.MAX_SAFE_INTEGER, rate: 0.45 },
  ],
  scoreWeights: { net: 25, cost: 20, is: 15, ir: 10, treasury: 20, social: 10 },
};

export const demoSettings: GeneralSettings = {
  raisonSociale: 'Aster Ingénierie Conseil SAS',
  exercice: '2026',
  dateCloture: '2026-12-31',
  activite: 'Ingénierie et études techniques',
  dirigeant: 'Président assimilé salarié',
  resultatProvisoire: 120000,
  tresorerieDisponible: 95000,
  remunerationDejaVersee: 29000,
  modeRemunerationVersee: 'brut',
  salaireConjoint: 26000,
  revenusLMNP: 9800,
  partsFoyer: 2,
  autresRevenus: 3500,
  objectif: 'equilibre',
};

export const demoScenarios: Scenario[] = [
  { id: 's1', nom: 'Prudence trésorerie', remunerationComplementaire: 18000, modeSaisie: 'brut', primeExceptionnelle: false, commentaires: 'Conserve une marge de cash', specificHypotheses: 'Aucune' },
  { id: 's2', nom: 'Équilibre cabinet', remunerationComplementaire: 32000, modeSaisie: 'brut', primeExceptionnelle: true, commentaires: 'Compromis coût/net', specificHypotheses: 'Prime exceptionnelle de clôture' },
  { id: 's3', nom: 'Max net dirigeant', remunerationComplementaire: 42000, modeSaisie: 'brut', primeExceptionnelle: true, commentaires: 'Accélère le net perçu', specificHypotheses: 'Tolérance trésorerie plus faible' },
];
