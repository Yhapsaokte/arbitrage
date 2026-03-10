import { OBJECTIFS, TABS } from './constants.js';
import { euro, int, percent, tmiLabel } from './format.js';

const optionSet = (r) => [
  { label: 'Recommandée', data: r.recommended },
  { label: 'Prudente', data: r.prudente },
  { label: 'Maximisation du net', data: r.maxNet },
];

const card = (title, o, featured = false) => `
<article class="card option-card ${featured ? 'featured' : ''}">
  <div class="row between"><h3>${title}</h3><span class="badge ${o.admissible ? 'ok' : 'danger'}">${o.admissible ? 'Admissible' : 'Non admissible'}</span></div>
  <p class="kpi">Montant réellement perçu par le foyer : <strong>${euro(o.netTotalFoyer)}</strong></p>
  <div class="grid two">
    <div><small>Salaire net dirigeant après IR</small><b>${euro(o.salaireNetApresIR)}</b></div>
    <div><small>Dividendes nets</small><b>${euro(o.dividends.dividendeNet)}</b></div>
    <div><small>IS</small><b>${euro(o.corporateTax.isTotal)}</b></div>
    <div><small>IR total foyer</small><b>${euro(o.householdTax.irTotal)}</b></div>
    <div><small>Trésorerie finale</small><b>${euro(o.tresorerie.tresorerieFinale)}</b></div>
    <div><small>Trimestres</small><b>${o.retraite.trimestresValides}/4</b></div>
  </div>
  ${o.alerts.length ? `<div class="alerts">${o.alerts.map((a) => `<span class="badge warn">${a}</span>`).join('')}</div>` : ''}
</article>`;

const lines = (rows) => {
  const max = Math.max(...rows.map((r) => Math.abs(r[1])), 1);
  return rows.map(([label, value, cls]) => `<div class="line"><span>${label}</span><div class="progress"><i class="${cls}" style="width:${Math.max(2, Math.abs(value) / max * 100)}%"></i></div><b>${euro(value)}</b></div>`).join('');
};

const fiscalRows = (o) => o.householdTax.lignesBareme.map((l) => `<tr><td>T${l.index}</td><td>${int(l.min)} - ${int(l.max)}</td><td>${percent(l.taux)}</td><td>${euro(l.assiette)}</td><td>${euro(l.impotParPart)}</td></tr>`).join('');

export const render = (root, state, result, onUpdate) => {
  const opts = optionSet(result);
  const rec = result.recommended;

  root.innerHTML = `
  <header class="topbar card">
    <div><h1>Arbitrage Rémunération / Dividendes SAS</h1><p>Modèle séparant clairement résultat, dividendes, trésorerie et fiscalité personnelle.</p></div>
    <div class="badge warn">Résultats indicatifs à valider professionnellement.</div>
  </header>

  <nav class="tabs card">${TABS.map(([id, label]) => `<button class="tab ${state.ui.activeTab===id?'active':''}" data-tab="${id}">${label}</button>`).join('')}</nav>

  <section class="view ${state.ui.activeTab==='entrees'?'on':''}">
    <article class="card"><h2>Entrées</h2>
      <h3>Société</h3><div class="grid four">
        <label>Raison sociale<input data-k="societe.raisonSociale" value="${state.societe.raisonSociale}"/></label>
        <label>Exercice<input data-k="societe.exercice" value="${state.societe.exercice}"/></label>
        <label>Activité<input data-k="societe.activite" value="${state.societe.activite}"/></label>
        <label>Résultat provisoire (€)<input type="number" data-k="societe.resultatProvisoire" value="${state.societe.resultatProvisoire}"/></label>
        <label>Trésorerie disponible (€)<input type="number" data-k="societe.tresorerieDisponible" value="${state.societe.tresorerieDisponible}"/></label>
        <label>Rémunération déjà versée (€)<input type="number" data-k="societe.remunerationDejaVersee" value="${state.societe.remunerationDejaVersee}"/></label>
        <label>Réserve minimale (€)<input type="number" data-k="societe.reserveSecurite" value="${state.societe.reserveSecurite}"/></label>
      </div>
      <h3>Foyer</h3><div class="grid four">
        <label>Nombre de parts<input type="number" data-k="foyer.parts" value="${state.foyer.parts}"/></label>
        <label>Salaire conjoint (€)<input type="number" data-k="foyer.salaireConjoint" value="${state.foyer.salaireConjoint}"/></label>
        <label>Revenus LMNP (€)<input type="number" data-k="foyer.revenusLMNP" value="${state.foyer.revenusLMNP}"/></label>
        <label>Autres revenus (€)<input type="number" data-k="foyer.autresRevenus" value="${state.foyer.autresRevenus}"/></label>
      </div>
      <h3>Simulation</h3><div class="grid four">
        <label>Objectif<select data-k="objectif">${OBJECTIFS.map((o)=>`<option value="${o.value}" ${state.objectif===o.value?'selected':''}>${o.label}</option>`).join('')}</select></label>
        <label>Mode<select data-k="simulation.mode"><option value="automatique" ${state.simulation.mode==='automatique'?'selected':''}>Optimisation automatique</option><option value="manuel" ${state.simulation.mode==='manuel'?'selected':''}>Simulation manuelle</option></select></label>
        <label>Rémunération brute manuelle (€)<input type="number" data-k="simulation.remunerationBruteManuelle" ${state.simulation.mode==='manuel'?'':'disabled'} value="${state.simulation.remunerationBruteManuelle}"/></label>
        <label>Dividende manuel<select data-k="simulation.dividendeManuelActif" ${state.simulation.mode==='manuel'?'':'disabled'}><option value="false" ${!state.simulation.dividendeManuelActif?'selected':''}>Automatique</option><option value="true" ${state.simulation.dividendeManuelActif?'selected':''}>Manuel</option></select></label>
        <label>Dividende manuel (€)<input type="number" data-k="simulation.dividendeManuel" ${(state.simulation.mode==='manuel'&&state.simulation.dividendeManuelActif)?'':'disabled'} value="${state.simulation.dividendeManuel}"/></label>
      </div>
    </article>
  </section>

  <section class="view ${state.ui.activeTab==='dashboard'?'on':''}">
    <article class="card spotlight"><h2>Scénario actif</h2>
      <p>Rémunération complémentaire <strong>${euro(rec.payroll.remunerationBruteComplementaire)}</strong>, dividende versé <strong>${euro(rec.dividends.dividendeVerse)}</strong>, net foyer <strong>${euro(rec.netTotalFoyer)}</strong>, trésorerie finale <strong>${euro(rec.tresorerie.tresorerieFinale)}</strong>.</p>
    </article>
    <div class="grid three">${card('Recommandée', opts[0].data, true)}${card('Prudente', opts[1].data)}${card('Maximisation du net', opts[2].data)}</div>
  </section>

  <section class="view ${state.ui.activeTab==='comparaison'?'on':''}"><article class="card"><h2>Comparaison des 3 options</h2><div class="grid three">${opts.map((o,i)=>card(o.label,o.data,i===0)).join('')}</div></article></section>

  <section class="view ${state.ui.activeTab==='flux'?'on':''}">
    <article class="card"><h2>Formation du résultat distribuable</h2>${lines([
      ['Résultat provisoire', rec.corporateTax.resultatProvisoire, 'tone-start'],
      ['- Rémunération brute', -rec.payroll.remunerationBruteComplementaire, 'tone-out'],
      ['- Charges patronales', -rec.payroll.chargesPatronales, 'tone-out'],
      ['= Résultat fiscal', rec.corporateTax.resultatFiscal, 'tone-rest'],
      ['- IS', -rec.corporateTax.isTotal, 'tone-is'],
      ['= Résultat après IS', rec.corporateTax.resultatApresIS, 'tone-rest'],
      ['→ Dividende distribuable théorique', rec.corporateTax.dividendeDistribuableTheorique, 'tone-div'],
    ])}</article>
    <article class="card"><h2>Impact sur la trésorerie</h2>${lines([
      ['Trésorerie initiale', rec.tresorerie.tresorerieInitiale, 'tone-start'],
      ['- Sortie rémunération', -rec.tresorerie.sortieRemuneration, 'tone-out'],
      ['- Sortie IS', -rec.tresorerie.sortieIS, 'tone-is'],
      ['- Sortie dividendes', -rec.tresorerie.sortieDividendes, 'tone-div'],
      ['= Trésorerie finale', rec.tresorerie.tresorerieFinale, 'tone-rest'],
    ])}
    <p class="note">Contrôle interne : trésorerie_initiale - sortie_totale = ${euro(rec.tresorerie.sommeFluxTresorerie)} (${rec.tresorerie.coherenceTresorerieOk?'OK':'Erreur'})</p>
    </article>
  </section>

  <section class="view ${state.ui.activeTab==='social'?'on':''}">
    <article class="card"><h2>Cotisations sociales</h2><table><tr><th>Élément</th><th>Formule</th><th>Montant</th></tr>
      <tr><td>Rémunération brute</td><td>R</td><td>${euro(rec.payroll.remunerationBruteComplementaire)}</td></tr>
      <tr><td>Charges patronales</td><td>R × taux patronal</td><td>${euro(rec.payroll.chargesPatronales)}</td></tr>
      <tr><td>Charges salariales</td><td>R × taux salarial</td><td>${euro(rec.payroll.chargesSalariales)}</td></tr>
      <tr><td>Coût total rémunération</td><td>R + charges patronales</td><td>${euro(rec.payroll.coutTotalRemuneration)}</td></tr>
      <tr><td>Net avant IR</td><td>R - charges salariales</td><td>${euro(rec.payroll.netAvantIR)}</td></tr>
      <tr><td>Net après IR</td><td>Net avant IR - surcoût IR</td><td>${euro(rec.salaireNetApresIR)}</td></tr>
    </table></article>
  </section>

  <section class="view ${state.ui.activeTab==='fiscalite'?'on':''}">
    <article class="card"><h2>Fiscalité (IS, dividendes, IR)</h2>
      <h3>IS</h3><table><tr><td>Base IS taux réduit</td><td>${euro(rec.corporateTax.baseReduite)}</td></tr><tr><td>Base IS taux normal</td><td>${euro(rec.corporateTax.baseNormale)}</td></tr><tr><td>IS total</td><td>${euro(rec.corporateTax.isTotal)}</td></tr></table>
      <h3>Dividendes</h3><table><tr><td>Distribuable théorique</td><td>${euro(rec.corporateTax.dividendeDistribuableTheorique)}</td></tr><tr><td>Dividende versé</td><td>${euro(rec.dividends.dividendeVerse)}</td></tr><tr><td>PFU</td><td>${euro(rec.dividends.pfu)}</td></tr><tr><td>Dividende net</td><td>${euro(rec.dividends.dividendeNet)}</td></tr></table>
      <h3>IR foyer</h3><p>Base imposable totale ${euro(rec.householdTax.baseImposableTotale)} • Quotient familial ${euro(rec.householdTax.quotientFamilial)} • TMI ${tmiLabel(rec.householdTax.tmi)} • IR total ${euro(rec.householdTax.irTotal)} • Surcoût scénario ${euro(rec.householdTax.surcoutIRScenario)}</p>
      <table><tr><th>Tranche</th><th>Bornes</th><th>Taux</th><th>Assiette/part</th><th>Impôt/part</th></tr>${fiscalRows(rec)}</table>
    </article>
  </section>

  <section class="view ${state.ui.activeTab==='parametres'?'on':''}"><article class="card"><h2>Paramètres</h2><div class="grid four">
    <label>Taux patronal<input type="number" step="0.01" data-k="params.tauxPatronal" value="${state.params.tauxPatronal}"/></label>
    <label>Taux salarial<input type="number" step="0.01" data-k="params.tauxSalarial" value="${state.params.tauxSalarial}"/></label>
    <label>Taux IS réduit<input type="number" step="0.01" data-k="params.tauxISReduit" value="${state.params.tauxISReduit}"/></label>
    <label>Plafond IS réduit<input type="number" data-k="params.plafondISReduit" value="${state.params.plafondISReduit}"/></label>
    <label>Taux IS normal<input type="number" step="0.01" data-k="params.tauxISNormal" value="${state.params.tauxISNormal}"/></label>
    <label>Taux PFU<input type="number" step="0.01" data-k="params.tauxPFU" value="${state.params.tauxPFU}"/></label>
    <label>Abattement salaire IR<input type="number" step="0.01" data-k="params.abattementSalaireIR" value="${state.params.abattementSalaireIR}"/></label>
    <label>Seuil trimestre<input type="number" data-k="params.seuilTrimestre" value="${state.params.seuilTrimestre}"/></label>
  </div></article></section>

  <section class="view ${state.ui.activeTab==='synthese'?'on':''}"><article class="card"><h2>Synthèse</h2><p>${state.societe.raisonSociale}: net foyer ${euro(rec.netTotalFoyer)}, IS ${euro(rec.corporateTax.isTotal)}, trésorerie finale ${euro(rec.tresorerie.tresorerieFinale)}.</p></article></section>

  <section class="view ${state.ui.activeTab==='annexes'?'on':''}"><article class="card"><h2>Annexes techniques</h2><ul>${result.hypotheses.map((h)=>`<li>${h}</li>`).join('')}</ul><p>Combinaisons testées: ${result.testedCount}, admissibles: ${result.admissibleCount}</p></article></section>
  `;

  root.querySelectorAll('[data-tab]').forEach((el) => el.addEventListener('click', () => onUpdate('ui.activeTab', el.dataset.tab)));
  root.querySelectorAll('[data-k]').forEach((el) => {
    el.addEventListener('change', (e) => {
      const path = e.target.dataset.k;
      let val;
      if (e.target.tagName === 'SELECT' && (e.target.value === 'true' || e.target.value === 'false')) val = e.target.value === 'true';
      else val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
      onUpdate(path, val);
    });
  });
};
