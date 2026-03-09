export const DEFAULT_INPUT = {
  ui: { activeTab: 'dashboard' },
  societe: {
    raisonSociale: 'Aster Ingénierie Conseil SAS',
    exercice: '2026',
    dateCloture: '31/12/2026',
    activite: 'Ingénierie et études techniques',
    resultatProvisoire: 120000,
    tresorerieDisponible: 98000,
    remunerationDejaVersee: 29000,
    dividendesDejaVerses: 0,
    reserveSecurite: 20000,
  },
  foyer: {
    parts: 2,
    autresRevenus: 4000,
    revenusLMNP: 9800,
    salaireConjoint: 26000,
    autresRevenusImposables: 3500,
  },
  objectif: 'equilibre',
  params: {
    tauxPatronal: 0.42,
    tauxSalarial: 0.22,
    tauxISReduit: 0.15,
    plafondISReduit: 42500,
    tauxISNormal: 0.25,
    tauxPFU: 0.3,
    abattementSalaireIR: 0.1,
    seuilTrimestre: 1800,
    pasSimulation: 1000,
    plancherRemuneration: 0,
    plafondRemuneration: 70000,
    seuilTresorerieResiduelle: 15000,
    niveauxDividendes: 5,
    baremeIR: [
      { min: 0, max: 11497, taux: 0 },
      { min: 11498, max: 29315, taux: 0.11 },
      { min: 29316, max: 83823, taux: 0.3 },
      { min: 83824, max: 180294, taux: 0.41 },
      { min: 180295, max: 1e12, taux: 0.45 },
    ],
  },
};

export const OBJECTIFS = [
  { value: 'max_net', label: 'Maximiser le net' },
  { value: 'tresorerie', label: 'Préserver la trésorerie' },
  { value: 'equilibre', label: 'Équilibre' },
  { value: 'social', label: 'Protection sociale' },
];

export const TABS = [
  ['dashboard', 'Dashboard'],
  ['comparaison', 'Comparaison'],
  ['flux', 'Flux financiers'],
  ['social', 'Cotisations sociales'],
  ['fiscalite', 'Fiscalité'],
  ['parametres', 'Paramètres'],
  ['synthese', 'Synthèse'],
  ['annexes', 'Annexes techniques'],
];
