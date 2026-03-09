import { OBJECTIFS } from './constants.js';
import { euro, tmiLabel } from './format.js';

const cardOption = (title, data, css = '') => `
  <article class="option ${css}">
    <div class="option-head"><h3>${title}</h3><span class="badge ${data.admissible ? 'ok' : 'danger'}">${data.admissible ? 'Admissible' : 'Non soutenable'}</span></div>
    <p class="big">Net final estimé : <strong>${euro(data.netFinal)}</strong></p>
    <div class="metrics">
      <div><small>Rémunération brute</small><b>${euro(data.remunerationBrute)}</b></div>
      <div><small>Dividendes versés</small><b>${euro(data.dividendesVerses)}</b></div>
      <div><small>IS estimé</small><b>${euro(data.isEstime)}</b></div>
      <div><small>IR foyer estimé</small><b>${euro(data.irFoyerTotal)}</b></div>
      <div><small>Sortie de trésorerie</small><b>${euro(data.sortieTresorerie)}</b></div>
      <div><small>Trésorerie restante</small><b>${euro(data.tresorerieRestante)}</b></div>
      <div><small>Trimestres validés</small><b>${data.trimestresValides}/4</b></div>
      <div><small>TMI estimatif</small><b>${tmiLabel(data.tmi)}</b></div>
    </div>
    <details><summary>Détail fiscal/social</summary>
      <ul>
        <li>Charges patronales : ${euro(data.chargesPatronales)}</li>
        <li>Charges salariales : ${euro(data.chargesSalariales)}</li>
        <li>Coût total société : ${euro(data.coutTotalSociete)}</li>
        <li>Net rémunération avant IR : ${euro(data.netRemunerationAvantIR)}</li>
        <li>Net dividendes : ${euro(data.netDividendes)}</li>
        <li>Surcoût IR lié à la simulation : ${euro(data.irAdditionnelSimulation)}</li>
      </ul>
    </details>
    ${data.alerts.length ? `<div class="alerts">${data.alerts.map((a) => `<span class="badge warn">${a}</span>`).join('')}</div>` : ''}
  </article>`;

const bars = (options) => {
  const netMax = Math.max(...options.map((o) => o.netFinal), 1);
  const outMax = Math.max(...options.map((o) => o.sortieTresorerie), 1);
  const restMax = Math.max(...options.map((o) => o.tresorerieRestante), 1);

  const renderBar = (label, key, max, cls) => `
    <div class="bar-group"><h4>${label}</h4>
      ${options.map((o) => `<div class="line"><span>${o._label}</span><div class="progress"><i class="${cls}" style="width:${Math.max(2, (o[key] / max) * 100)}%"></i></div><b>${euro(o[key])}</b></div>`).join('')}
    </div>`;

  return renderBar('Net final', 'netFinal', netMax, 'tone-net') + renderBar('Sortie de trésorerie', 'sortieTresorerie', outMax, 'tone-out') + renderBar('Trésorerie restante', 'tresorerieRestante', restMax, 'tone-rest');
};

export const render = (root, state, result, onUpdate) => {
  const options = [
    { ...result.recommended, _label: 'Recommandée' },
    { ...result.prudente, _label: 'Prudente' },
    { ...result.maxNet, _label: 'Maximisation du net' },
  ];

  root.innerHTML = `
    <header class="hero panel">
      <div>
        <h1>Arbitrage Rémunération / Dividendes SAS</h1>
        <p>Outil d’aide à la décision cabinet — optimisation automatique et restitution lisible.</p>
      </div>
      <div class="disclaimer">Les résultats sont fournis à titre indicatif sur la base des hypothèses retenues et doivent être validés par un professionnel.</div>
    </header>

    <section class="panel form-panel">
      <h2>Dossier & objectif</h2>
      <div class="form-grid">
        <label>Raison sociale<input data-k="societe.raisonSociale" value="${state.societe.raisonSociale}" /></label>
        <label>Résultat provisoire (€)<input data-k="societe.resultatProvisoire" type="number" value="${state.societe.resultatProvisoire}" /></label>
        <label>Trésorerie disponible (€)<input data-k="societe.tresorerieDisponible" type="number" value="${state.societe.tresorerieDisponible}" /></label>
        <label>Rémunération déjà versée (€)<input data-k="societe.remunerationDejaVersee" type="number" value="${state.societe.remunerationDejaVersee}" /></label>
        <label>Réserve sécurité (€)<input data-k="societe.reserveSecurite" type="number" value="${state.societe.reserveSecurite}" /></label>
        <label>Nombre de parts<input data-k="foyer.parts" type="number" value="${state.foyer.parts}" /></label>
        <label>Salaire conjoint (€)<input data-k="foyer.salaireConjoint" type="number" value="${state.foyer.salaireConjoint}" /></label>
        <label>Revenus LMNP (€)<input data-k="foyer.revenusLMNP" type="number" value="${state.foyer.revenusLMNP}" /></label>
        <label>Autres revenus (€)<input data-k="foyer.autresRevenus" type="number" value="${state.foyer.autresRevenus}" /></label>
        <label>Objectif
          <select data-k="objectif">${OBJECTIFS.map((o) => `<option value="${o.value}" ${state.objectif === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}</select>
        </label>
      </div>
    </section>

    <section class="panel spotlight">
      <h2>Arbitrage recommandé</h2>
      <p>Au regard du résultat provisoire, de la trésorerie disponible, de la rémunération déjà versée et de l’objectif retenu, l’option recommandée consiste à retenir une rémunération complémentaire de <strong>${euro(result.recommended.remunerationBrute)}</strong> et une distribution de dividendes de <strong>${euro(result.recommended.dividendesVerses)}</strong>. Cette option permet d’obtenir un net estimatif de <strong>${euro(result.recommended.netFinal)}</strong>, tout en maintenant une trésorerie résiduelle de <strong>${euro(result.recommended.tresorerieRestante)}</strong> et en validant <strong>${result.recommended.trimestresValides}/4</strong> trimestres.</p>
    </section>

    <section class="panel compare">
      <h2>Comparaison des 3 options utiles</h2>
      <div class="options-grid">
        ${cardOption('Option recommandée', result.recommended, 'featured')}
        ${cardOption('Option prudente', result.prudente)}
        ${cardOption('Option maximisation du net', result.maxNet)}
      </div>
    </section>

    <section class="panel charts">
      <h2>Lecture visuelle</h2>
      ${bars(options)}
    </section>

    <section class="panel hypotheses">
      <h2>Hypothèses de simulation (indicatives)</h2>
      <ul>${result.hypotheses.map((h) => `<li>${h}</li>`).join('')}</ul>
      <p>${result.admissibleCount} options admissibles sur ${result.testedCount} combinaisons testées.</p>
    </section>
  `;

  root.querySelectorAll('[data-k]').forEach((el) => {
    el.addEventListener('change', (e) => {
      const key = e.target.getAttribute('data-k');
      const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
      onUpdate(key, value);
    });
  });
};
