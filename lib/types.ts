export type ScenarioObjective =
  | 'reduire_is'
  | 'max_net'
  | 'preserver_treso'
  | 'valider_trimestres'
  | 'equilibre';

export type InputMode = 'brut' | 'net';

export interface GeneralSettings {
  raisonSociale: string;
  exercice: string;
  dateCloture: string;
  activite: string;
  dirigeant: string;
  resultatProvisoire: number;
  tresorerieDisponible: number;
  remunerationDejaVersee: number;
  modeRemunerationVersee: InputMode;
  salaireConjoint: number;
  revenusLMNP: number;
  partsFoyer: number;
  autresRevenus: number;
  objectif: ScenarioObjective;
}

export interface TaxBracket {
  from: number;
  to: number;
  rate: number;
}

export interface CalcParameters {
  referenceYear: number;
  isReducedRate: number;
  isReducedCeiling: number;
  isNormalRate: number;
  employerContribRate: number;
  employeeContribRate: number;
  salaryIrAllowanceRate: number;
  flatTaxRate: number;
  lmnpTaxRate: number;
  quarterValidationThreshold: number;
  quarterMax: number;
  irBrackets: TaxBracket[];
  scoreWeights: {
    net: number;
    cost: number;
    is: number;
    ir: number;
    treasury: number;
    social: number;
  };
}

export interface Scenario {
  id: string;
  nom: string;
  remunerationComplementaire: number;
  modeSaisie: InputMode;
  primeExceptionnelle: boolean;
  commentaires: string;
  specificHypotheses: string;
}

export interface ScenarioResult {
  scenarioId: string;
  resultatApresRemuneration: number;
  isEstime: number;
  variationIS: number;
  chargesSociales: number;
  coutTotalSociete: number;
  netDirigeant: number;
  irFoyer: number;
  impactTresorerie: number;
  trimestresValides: number;
  scoreGlobal: number;
  pointsVigilance: string[];
}
