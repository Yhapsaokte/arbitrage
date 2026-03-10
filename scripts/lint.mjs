import { readFileSync } from 'node:fs';

const simulation = readFileSync('web/js/simulation.js', 'utf8');
const optimizer = readFileSync('web/js/optimizer.js', 'utf8');
const ui = readFileSync('web/js/ui.js', 'utf8');
const constants = readFileSync('web/js/constants.js', 'utf8');
const main = readFileSync('web/js/main.js', 'utf8');

const checks = [
  [constants.includes("['entrees', 'Entrées']"), 'Onglet Entrées manquant'],
  [simulation.includes('computeCorporateTax') && simulation.includes('computeDividends') && simulation.includes('computeHouseholdIncomeTax'), 'Chaînes de calcul séparées manquantes'],
  [simulation.includes('sortieTresorerieTotale') && simulation.includes('coherenceTresorerieOk'), 'Chaîne trésorerie incohérente'],
  [simulation.includes('manualDividend'), 'Gestion dividende manuel manquante'],
  [optimizer.includes('pickRecommendedOptions') && optimizer.includes('[0, 0.25, 0.5, 0.75, 1]'), 'Optimisation structurée manquante'],
  [main.includes('simulation.mode') && main.includes('evaluateScenario'), 'Mode manuel non branché'],
  [ui.includes('Rémunération brute manuelle') && ui.includes('Dividende manuel') && ui.includes('Trésorerie disponible'), 'Formulaire interactif incomplet'],
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  failed.forEach(([, msg]) => console.error(msg));
  process.exit(1);
}

console.log('Lint statique OK');
