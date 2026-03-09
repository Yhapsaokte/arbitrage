import { readFileSync } from 'node:fs';

const simulation = readFileSync('web/js/simulation.js', 'utf8');
const optimizer = readFileSync('web/js/optimizer.js', 'utf8');
const ui = readFileSync('web/js/ui.js', 'utf8');
const constants = readFileSync('web/js/constants.js', 'utf8');

const checks = [
  [constants.includes('TABS'), 'Navigation par onglets absente'],
  [simulation.includes('computePayroll'), 'computePayroll manquant'],
  [simulation.includes('computeCorporateTax'), 'computeCorporateTax manquant'],
  [simulation.includes('computeDividends'), 'computeDividends manquant'],
  [simulation.includes('computeHouseholdIncomeTax'), 'computeHouseholdIncomeTax manquant'],
  [simulation.includes('computeRetirementQuarters'), 'computeRetirementQuarters manquant'],
  [simulation.includes('evaluateScenario'), 'evaluateScenario manquant'],
  [optimizer.includes('pickRecommendedOptions'), 'pickRecommendedOptions manquant'],
  [ui.includes('Arbitrage recommandé'), 'Restitution recommandée manquante'],
  [ui.includes('Annexes techniques'), 'Onglet annexes manquant'],
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  failed.forEach(([, msg]) => console.error(msg));
  process.exit(1);
}

console.log('Lint statique OK');
