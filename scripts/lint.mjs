import { readFileSync } from 'node:fs';
const html = readFileSync('web/index.html', 'utf8');
const js = readFileSync('web/app.js', 'utf8');
if (!html.includes('Les résultats sont fournis à titre indicatif')) {
  console.error('Avertissement réglementaire manquant');
  process.exit(1);
}
if (!js.includes('score')) {
  console.error('Moteur de score manquant');
  process.exit(1);
}
console.log('Lint statique OK');
