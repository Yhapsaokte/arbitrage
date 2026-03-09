import { readFileSync } from 'node:fs';

const simulation = readFileSync('web/js/simulation.js', 'utf8');
const optimizer = readFileSync('web/js/optimizer.js', 'utf8');
const ui = readFileSync('web/js/ui.js', 'utf8');
const constants = readFileSync('web/js/constants.js', 'utf8');
const main = readFileSync('web/js/main.js', 'utf8');

const checks = [
  [constants.includes("['entrees', 'Entrées']"), 'Onglet Entrées manquant'],
  [constants.includes('simulation'), 'State simulation manquant'],
  [simulation.includes('manualDividend'), 'Gestion dividende manuel manquante'],
  [optimizer.includes('pickRecommendedOptions'), 'pickRecommendedOptions manquant'],
  [main.includes('simulation.mode'), 'Mode manuel non branché'],
  [ui.includes('Mode') && ui.includes('Rémunération brute complémentaire manuelle'), 'Champs de saisie manuels absents'],
  [ui.includes('Raison sociale') && ui.includes('Trésorerie disponible') && ui.includes('Nombre de parts'), 'Formulaire Entrées incomplet'],
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  failed.forEach(([, msg]) => console.error(msg));
  process.exit(1);
}

console.log('Lint statique OK');
