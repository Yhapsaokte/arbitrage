import { OBJECTIFS, TABS } from './constants.js';
import { euro, int, percent, tmiLabel } from './format.js';

const pickOptions = (r) => [
  { key: 'recommended', label: 'Recommandée', data: r.recommended },
  { key: 'prudente', label: 'Prudente', data: r.prudente },
  { key: 'maxNet', label: 'Maximisation du net', data: r.maxNet },
];

const optionCard = (name, o) => `
<article class="card option-card ${name === 'Recommandée' ? 'featured' : ''}">
  <div class="row between"><h3>${name}</h3><span class="badge ${o.admissible ? 'ok' : 'danger'}">${o.admissible ? 'Admissible' : 'Non admissible'}</span></div>
  <p class="kpi">Montant réellement perçu par le foyer: <strong>${euro(o.netTotalFoyer)}</strong></p>
  <div class="grid two">
    <div><small>Salaire net dirigeant après IR</small><b>${euro(o.salaireNetApresIR)}</b></div>
    <div><small>Dividendes nets</small><b>${euro(o.dividends.netDividendes)}</b></div>
    <div><small>IS</small><b>${euro(o.corporateTax.isTotal)}</b></div>
    <div><small>IR additionnel</small><b>${euro(o.householdTax.irAdditionnel)}</b></div>
    <div><small>Sortie de trésorerie</small><b>${euro(o.sortieTresorerie)}</b></div>
    <div><small>Trimestres</small><b>${o.retraite.trimestresValides}/4</b></div>
  </div>
  ${o.alerts.length ? `<div class="alerts">${o.alerts.map((a) => `<span class="badge warn">${a}</span>`).join('')}</div>` : ''}
</article>`;

const barsCompare = (options) => {
  const keys = [
    ['netTotalFoyer', 'Net foyer', 'tone-net'],
    ['sortieTresorerie', 'Sortie trésorerie', 'tone-out'],
    ['corporateTax.isTotal', 'IS', 'tone-is'],
    ['householdTax.irAdditionnel', 'IR additionnel', 'tone-ir'],
  ];
  const get = (obj, path) => path.split('.').reduce((a, k) => a[k], obj);

  return keys.map(([k, label, cls]) => {
    const max = Math.max(...options.map((o) => get(o.data, k)), 1);
    return `<div class="bar-panel"><h4>${label}</h4>${options.map((o) => {
      const val = get(o.data, k);
      return `<div class="line"><span>${o.label}</span><div class="progress"><i class="${cls}" style="width:${Math.max(2, (val / max) * 100)}%"></i></div><b>${euro(val)}</b></div>`;
    }).join('')}</div>`;
  }).join('');
};

const optimisationChart = (curve, recommendedRem) => {
  const maxNet = Math.max(...curve.map((c) => c.net), 1);
  return `<div class="curve">${curve.map((p) => {
    const h = Math.max(2, (p.net / maxNet) * 100);
    const best = p.remuneration === recommendedRem;
    return `<div class="curve-col ${best ? 'best' : ''}" title="Rémunération ${euro(p.remuneration)} / Net ${euro(p.net)}"><i style="height:${h}%"></i></div>`;
  }).join('')}</div>`;
};

const waterfall = (o, state) => {
  const rows = [
    ['Résultat provisoire', state.societe.resultatProvisoire, 'tone-start'],
    ['- Rémunération brute', -o.payroll.remunerationBrute, 'tone-out'],
    ['- Charges patronales', -o.payroll.chargesPatronales, 'tone-out'],
    ['- IS', -o.corporateTax.isTotal, 'tone-is'],
    ['- Dividendes versés', -o.dividends.dividendeVerse, 'tone-div'],
    ['= Trésorerie restante', o.tresorerieRestante, 'tone-rest'],
  ];
  const max = Math.max(...rows.map((r) => Math.abs(r[1])), 1);
  return rows.map((r) => `<div class="line"><span>${r[0]}</span><div class="progress"><i class="${r[2]}" style="width:${Math.max(2, (Math.abs(r[1]) / max) * 100)}%"></i></div><b>${euro(r[1])}</b></div>`).join('');
};

const radarFake = (o, state) => {
  const net = Math.min(100, (o.netTotalFoyer / Math.max(1, state.societe.resultatProvisoire)) * 120);
  const social = (o.retraite.trimestresValides / 4) * 100;
  const treso = Math.min(100, (o.tresorerieRestante / Math.max(1, state.societe.tresorerieDisponible)) * 100);
  const fiscal = Math.max(0, 100 - ((o.corporateTax.isTotal + o.householdTax.irAdditionnel) / Math.max(1, state.societe.resultatProvisoire)) * 120);
  return `<div class="diamond" style="--n:${net}%;--s:${social}%;--t:${treso}%;--f:${fiscal}%"></div>
  <div class="legend-mini"><span>Net: ${net.toFixed(0)}</span><span>Social: ${social.toFixed(0)}</span><span>Trésorerie: ${treso.toFixed(0)}</span><span>Fiscalité: ${fiscal.toFixed(0)}</span></div>`;
};

const fiscalRows = (o) => o.householdTax.lignesBareme.map((l) => `<tr><td>T${l.index}</td><td>${int(l.min)} - ${int(l.max)}</td><td>${percent(l.taux)}</td><td>${euro(l.assiette)}</td><td>${euro(l.impotParPart)}</td></tr>`).join('');

export const render = (root, state, result, onUpdate) => {
  const options = pickOptions(result);
  const rec = result.recommended;

  root.innerHTML = `
  <header class="topbar card">
    <div>
      <h1>Arbitrage Rémunération / Dividendes SAS</h1>
      <p>Application d’aide à la décision cabinet — optimisation automatique et simulation manuelle.</p>
    </div>
    <div class="badge warn">Les résultats sont fournis à titre indicatif et doivent être validés par un professionnel.</div>
  </header>

  <nav class="tabs card">${TABS.map(([id, label]) => `<button class="tab ${state.ui.activeTab === id ? 'active' : ''}" data-tab="${id}">${label}</button>`).join('')}</nav>

  <section class="view ${state.ui.activeTab === 'entrees' ? 'on' : ''}">
    <article class="card"><h2>Entrées du dossier</h2><p>Modifiez librement les données ci-dessous : tous les calculs sont recalculés instantanément.</p>
      <h3>Société</h3>
      <div class="grid four">
        <label>Raison sociale<input data-k="societe.raisonSociale" placeholder="Nom de la société" value="${state.societe.raisonSociale}"/></label>
        <label>Exercice<input data-k="societe.exercice" placeholder="2026" value="${state.societe.exercice}"/></label>
        <label>Activité<input data-k="societe.activite" placeholder="Activité" value="${state.societe.activite}"/></label>
        <label>Résultat provisoire (€)<input type="number" data-k="societe.resultatProvisoire" value="${state.societe.resultatProvisoire}"/></label>
        <label>Trésorerie disponible (€)<input type="number" data-k="societe.tresorerieDisponible" value="${state.societe.tresorerieDisponible}"/></label>
        <label>Rémunération déjà versée (€)<input type="number" data-k="societe.remunerationDejaVersee" value="${state.societe.remunerationDejaVersee}"/></label>
        <label>Réserve minimale (€)<input type="number" data-k="societe.reserveSecurite" value="${state.societe.reserveSecurite}"/></label>
      </div>

      <h3>Foyer fiscal</h3>
      <div class="grid four">
        <label>Nombre de parts<input type="number" data-k="foyer.parts" value="${state.foyer.parts}"/></label>
        <label>Salaire conjoint (€)<input type="number" data-k="foyer.salaireConjoint" value="${state.foyer.salaireConjoint}"/></label>
        <label>Revenus LMNP (€)<input type="number" data-k="foyer.revenusLMNP" value="${state.foyer.revenusLMNP}"/></label>
        <label>Autres revenus (€)<input type="number" data-k="foyer.autresRevenus" value="${state.foyer.autresRevenus}"/></label>
      </div>

      <h3>Simulation</h3>
      <div class="grid four">
        <label>Objectif<select data-k="objectif">${OBJECTIFS.map((o) => `<option value="${o.value}" ${state.objectif === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}</select></label>
        <label>Mode
          <select data-k="simulation.mode">
            <option value="automatique" ${state.simulation.mode === 'automatique' ? 'selected' : ''}>Optimisation automatique</option>
            <option value="manuel" ${state.simulation.mode === 'manuel' ? 'selected' : ''}>Simulation manuelle</option>
          </select>
        </label>
        <label>Rémunération brute complémentaire manuelle (€)<input type="number" data-k="simulation.remunerationBruteManuelle" value="${state.simulation.remunerationBruteManuelle}" ${state.simulation.mode === 'manuel' ? '' : 'disabled'} /></label>
        <label>Dividende manuel activé
          <select data-k="simulation.dividendeManuelActif" ${state.simulation.mode === 'manuel' ? '' : 'disabled'}>
            <option value="false" ${!state.simulation.dividendeManuelActif ? 'selected' : ''}>Non (auto)</option>
            <option value="true" ${state.simulation.dividendeManuelActif ? 'selected' : ''}>Oui</option>
          </select>
        </label>
        <label>Dividende manuel (€)<input type="number" data-k="simulation.dividendeManuel" value="${state.simulation.dividendeManuel}" ${(state.simulation.mode === 'manuel' && state.simulation.dividendeManuelActif) ? '' : 'disabled'} /></label>
      </div>
      <p class="note">Mode manuel : l’application calcule à partir de votre rémunération brute saisie, et du dividende saisi si activé (avec plafonnement de cohérence).</p>
    </article>
  </section>

  <section class="view ${state.ui.activeTab === 'dashboard' ? 'on' : ''}">
    <div class="grid three">
      <article class="card"><h3>Dossier</h3><p>${state.societe.raisonSociale}</p><small>Exercice ${state.societe.exercice} • ${state.societe.activite}</small></article>
      <article class="card"><h3>Objectif retenu</h3><p>${OBJECTIFS.find((o) => o.value === state.objectif)?.label}</p><small>Mode: ${state.simulation.mode === 'automatique' ? 'Optimisation automatique' : 'Simulation manuelle'}</small></article>
      <article class="card"><h3>Trésorerie disponible</h3><p>${euro(state.societe.tresorerieDisponible)}</p><small>Réserve minimale: ${euro(state.societe.reserveSecurite)}</small></article>
    </div>
    <article class="card spotlight"><h2>Arbitrage recommandé</h2><p>Au regard du résultat provisoire, de la trésorerie disponible, de la rémunération déjà versée et de l’objectif retenu, l’option active consiste à retenir une rémunération complémentaire de <strong>${euro(rec.remunerationBrute)}</strong> et une distribution de dividendes de <strong>${euro(rec.dividends.dividendeVerse)}</strong>. Cette option aboutit à un montant perçu par le foyer de <strong>${euro(rec.netTotalFoyer)}</strong>, avec une trésorerie restante de <strong>${euro(rec.tresorerieRestante)}</strong>, un IS de <strong>${euro(rec.corporateTax.isTotal)}</strong> et <strong>${rec.retraite.trimestresValides}/4</strong> trimestres validés.</p></article>
    <div class="grid three">${options.map((o) => optionCard(o.label, o.data)).join('')}</div>
    <article class="card"><h3>Alertes principales</h3>${[...new Set(options.flatMap((o) => o.data.alerts))].map((a) => `<span class="badge warn">${a}</span>`).join('') || '<span class="badge ok">Aucune alerte majeure</span>'}</article>
  </section>

  <section class="view ${state.ui.activeTab === 'comparaison' ? 'on' : ''}">
    <article class="card"><h2>Comparaison des 3 options utiles</h2><div class="grid three">${options.map((o) => optionCard(o.label, o.data)).join('')}</div></article>
    <article class="card"><h3>Comparaison interactive</h3>${barsCompare(options)}</article>
    <article class="card"><h3>Courbe d’optimisation (net foyer selon rémunération)</h3>${optimisationChart(result.optimisationCurve, rec.remunerationBrute)}</article>
  </section>

  <section class="view ${state.ui.activeTab === 'flux' ? 'on' : ''}">
    <article class="card"><h2>Flux financiers</h2><p>Lecture pédagogique de l’origine et de la destination de l’argent de la société.</p>${waterfall(rec, state)}</article>
    <article class="card"><h3>Où part 1 € généré</h3><div class="grid four">
      <div><small>Salaire brut</small><b>${percent(rec.fluxRepartition.salaireBrut / Math.max(1, state.societe.resultatProvisoire))}</b></div>
      <div><small>Charges patronales</small><b>${percent(rec.fluxRepartition.chargesPatronales / Math.max(1, state.societe.resultatProvisoire))}</b></div>
      <div><small>IS</small><b>${percent(rec.fluxRepartition.is / Math.max(1, state.societe.resultatProvisoire))}</b></div>
      <div><small>Dividendes</small><b>${percent(rec.fluxRepartition.dividendes / Math.max(1, state.societe.resultatProvisoire))}</b></div>
    </div></article>
  </section>

  <section class="view ${state.ui.activeTab === 'social' ? 'on' : ''}">
    <article class="card"><h2>Cotisations sociales</h2>
      <table><tr><th>Élément</th><th>Formule</th><th>Montant</th></tr>
      <tr><td>Salaire brut complémentaire</td><td>R</td><td>${euro(rec.payroll.remunerationBrute)}</td></tr>
      <tr><td>Charges patronales</td><td>R × taux patronal</td><td>${euro(rec.payroll.chargesPatronales)}</td></tr>
      <tr><td>Charges salariales</td><td>R × taux salarial</td><td>${euro(rec.payroll.chargesSalariales)}</td></tr>
      <tr><td>Coût total entreprise</td><td>R + charges patronales</td><td>${euro(rec.payroll.coutTotalEntreprise)}</td></tr>
      <tr><td>Net avant IR</td><td>R - charges salariales</td><td>${euro(rec.payroll.netAvantIR)}</td></tr>
      <tr><td>Net après IR</td><td>Net avant IR - IR additionnel</td><td>${euro(rec.salaireNetApresIR)}</td></tr>
      </table>
    </article>
    <article class="card"><h3>Validation retraite</h3><p>Rémunération déjà versée: ${euro(state.societe.remunerationDejaVersee)} • Complément: ${euro(rec.remunerationBrute)} • Total annuel soumis: ${euro(rec.retraite.remunerationAnnuelleSoumise)} • Seuil trimestre: ${euro(state.params.seuilTrimestre)} • <strong>${rec.retraite.trimestresValides}/4</strong></p></article>
  </section>

  <section class="view ${state.ui.activeTab === 'fiscalite' ? 'on' : ''}">
    <article class="card"><h2>Fiscalité détaillée</h2>
      <h3>IS par paliers</h3>
      <table><tr><th>Poste</th><th>Montant</th></tr>
      <tr><td>Résultat provisoire</td><td>${euro(state.societe.resultatProvisoire)}</td></tr>
      <tr><td>Rémunération brute</td><td>${euro(rec.payroll.remunerationBrute)}</td></tr>
      <tr><td>Charges patronales</td><td>${euro(rec.payroll.chargesPatronales)}</td></tr>
      <tr><td>Résultat fiscal après rémunération</td><td>${euro(rec.corporateTax.resultatFiscal)}</td></tr>
      <tr><td>Base IS taux réduit</td><td>${euro(rec.corporateTax.baseReduite)}</td></tr>
      <tr><td>Base IS taux normal</td><td>${euro(rec.corporateTax.baseNormale)}</td></tr>
      <tr><td>IS total</td><td>${euro(rec.corporateTax.isTotal)}</td></tr>
      </table>
      <h3>Dividendes</h3>
      <table><tr><th>Poste</th><th>Montant</th></tr>
      <tr><td>Distribuable théorique</td><td>${euro(rec.dividends.distribuableTheorique)}</td></tr>
      <tr><td>Dividende versé</td><td>${euro(rec.dividends.dividendeVerse)}</td></tr>
      <tr><td>PFU</td><td>${euro(rec.dividends.pfu)}</td></tr>
      <tr><td>Net dividendes</td><td>${euro(rec.dividends.netDividendes)}</td></tr>
      </table>
      <p class="note">Le dividende ne réduit pas l’IS, ne valide pas de trimestres et n’ouvre pas les mêmes droits sociaux que la rémunération.</p>
      <h3>IR foyer</h3>
      <p>Base imposable totale: ${euro(rec.householdTax.baseFoyerTotale)} • Quotient familial: ${euro(rec.householdTax.quotientFamilial)} • TMI estimatif: ${tmiLabel(rec.householdTax.tmi)} • IR total: ${euro(rec.householdTax.irTotal)} • Surcoût IR scénario: ${euro(rec.householdTax.irAdditionnel)}</p>
      <table><tr><th>Tranche</th><th>Bornes</th><th>Taux</th><th>Assiette / part</th><th>Impôt / part</th></tr>${fiscalRows(rec)}</table>
    </article>
    <article class="card"><h3>Radar d’équilibre</h3>${radarFake(rec, state)}</article>
  </section>

  <section class="view ${state.ui.activeTab === 'parametres' ? 'on' : ''}">
    <article class="card"><h2>Paramètres de calcul</h2>
      <div class="grid four">
        <label>Taux patronal<input type="number" step="0.01" data-k="params.tauxPatronal" value="${state.params.tauxPatronal}" /></label>
        <label>Taux salarial<input type="number" step="0.01" data-k="params.tauxSalarial" value="${state.params.tauxSalarial}" /></label>
        <label>Taux IS réduit<input type="number" step="0.01" data-k="params.tauxISReduit" value="${state.params.tauxISReduit}" /></label>
        <label>Plafond IS réduit<input type="number" step="100" data-k="params.plafondISReduit" value="${state.params.plafondISReduit}" /></label>
        <label>Taux IS normal<input type="number" step="0.01" data-k="params.tauxISNormal" value="${state.params.tauxISNormal}" /></label>
        <label>Taux PFU<input type="number" step="0.01" data-k="params.tauxPFU" value="${state.params.tauxPFU}" /></label>
        <label>Abattement salaire IR<input type="number" step="0.01" data-k="params.abattementSalaireIR" value="${state.params.abattementSalaireIR}" /></label>
        <label>Seuil trimestre<input type="number" step="100" data-k="params.seuilTrimestre" value="${state.params.seuilTrimestre}" /></label>
        <label>Pas simulation<input type="number" step="100" data-k="params.pasSimulation" value="${state.params.pasSimulation}" /></label>
        <label>Rémunération min<input type="number" step="100" data-k="params.plancherRemuneration" value="${state.params.plancherRemuneration}" /></label>
        <label>Rémunération max<input type="number" step="100" data-k="params.plafondRemuneration" value="${state.params.plafondRemuneration}" /></label>
        <label>Niveaux dividendes testés<input type="number" step="1" data-k="params.niveauxDividendes" value="${state.params.niveauxDividendes}" /></label>
      </div>
      <h3>Barème IR paramétrable</h3>
      <table><tr><th>Tranche</th><th>Min</th><th>Max</th><th>Taux</th></tr>
      ${state.params.baremeIR.map((t, i) => `<tr><td>T${i + 1}</td><td><input type="number" data-k="params.baremeIR.${i}.min" value="${t.min}"/></td><td><input type="number" data-k="params.baremeIR.${i}.max" value="${t.max}"/></td><td><input type="number" step="0.01" data-k="params.baremeIR.${i}.taux" value="${t.taux}"/></td></tr>`).join('')}
      </table>
    </article>
  </section>

  <section class="view ${state.ui.activeTab === 'synthese' ? 'on' : ''}">
    <article class="card print-area"><h2>Note de synthèse cabinet / client</h2>
      <p><strong>${state.societe.raisonSociale}</strong> • Exercice ${state.societe.exercice} • Clôture ${state.societe.dateCloture}</p>
      <p>L’option active retient une rémunération complémentaire de ${euro(rec.remunerationBrute)} et un dividende de ${euro(rec.dividends.dividendeVerse)}. Elle conduit à un montant perçu par le foyer de ${euro(rec.netTotalFoyer)} avec un IS de ${euro(rec.corporateTax.isTotal)} et une trésorerie restante de ${euro(rec.tresorerieRestante)}.</p>
    </article>
  </section>

  <section class="view ${state.ui.activeTab === 'annexes' ? 'on' : ''}">
    <article class="card"><h2>Annexes techniques</h2>
      <h3>Formules utilisées</h3>
      <ul>
        <li>Charges patronales = rémunération brute × taux patronal</li>
        <li>Charges salariales = rémunération brute × taux salarial</li>
        <li>Résultat fiscal = résultat provisoire - rémunération brute - charges patronales</li>
        <li>IS = base réduite × taux réduit + base normale × taux normal</li>
        <li>Dividende versé ≤ min(distribuable théorique, capacité de trésorerie)</li>
      </ul>
      <ul>${result.hypotheses.map((h) => `<li>${h}</li>`).join('')}</ul>
      <p>Combinaisons testées: ${result.testedCount} • Options admissibles: ${result.admissibleCount}</p>
    </article>
  </section>
  `;

  root.querySelectorAll('[data-tab]').forEach((el) => el.addEventListener('click', () => onUpdate('ui.activeTab', el.dataset.tab)));
  root.querySelectorAll('[data-k]').forEach((el) => {
    const evt = ['INPUT', 'TEXTAREA'].includes(el.tagName) ? 'input' : 'change';
    el.addEventListener(evt, (e) => {
      const path = e.target.dataset.k;
      let val;
      if (e.target.tagName === 'SELECT' && (e.target.value === 'true' || e.target.value === 'false')) val = e.target.value === 'true';
      else val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
      onUpdate(path, val);
    });
  });
};
