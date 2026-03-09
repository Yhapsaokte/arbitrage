import { readFileSync } from 'node:fs';

const index = readFileSync('web/index.html', 'utf8');
const simulation = readFileSync('web/js/simulation.js', 'utf8');
const optimizer = readFileSync('web/js/optimizer.js', 'utf8');
const ui = readFileSync('web/js/ui.js', 'utf8');

const checks = [
  [index.includes('type="module"'), 'Entrée modulaire absente'],
  [index.includes('Arbitrage Rémunération / Dividendes SAS'), 'Titre application manquant'],
  [ui.includes('Arbitrage recommandé'), 'Carte d’arbitrage recommandée manquante'],
  [simulation.includes('trimestresValides'), 'Calcul trimestres manquant'],
  [simulation.includes('tmi'), 'Calcul TMI manquant'],
  [simulation.includes('dividendesVerses'), 'Logique dividendes manquante'],
  [optimizer.includes('recommended') && optimizer.includes('prudente') && optimizer.includes('maxNet'), 'Sélection des 3 options manquante'],
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  failed.forEach(([, msg]) => console.error(msg));
  process.exit(1);
}

console.log('Lint statique OK');
