const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// === 1) Chaîne sociale ===
export const computePayroll = (remunerationBruteComplementaire, params) => {
  const chargesPatronales = remunerationBruteComplementaire * params.tauxPatronal;
  const chargesSalariales = remunerationBruteComplementaire * params.tauxSalarial;
  const coutTotalRemuneration = remunerationBruteComplementaire + chargesPatronales;
  const netAvantIR = remunerationBruteComplementaire - chargesSalariales;
  return {
    remunerationBruteComplementaire,
    chargesPatronales,
    chargesSalariales,
    coutTotalRemuneration,
    netAvantIR,
  };
};

// === 2) Chaîne résultat comptable/fiscal ===
export const computeCorporateTax = (resultatProvisoire, payroll, params) => {
  const resultatFiscal =
    resultatProvisoire - payroll.remunerationBruteComplementaire - payroll.chargesPatronales;

  const baseReduite = clamp(resultatFiscal, 0, params.plafondISReduit);
  const baseNormale = Math.max(0, resultatFiscal - params.plafondISReduit);

  const isReduit = baseReduite * params.tauxISReduit;
  const isNormal = baseNormale * params.tauxISNormal;
  const isTotal = isReduit + isNormal;

  const resultatApresIS = resultatFiscal - isTotal;
  const dividendeDistribuableTheorique = Math.max(resultatApresIS, 0);

  return {
    resultatProvisoire,
    resultatFiscal,
    baseReduite,
    baseNormale,
    isReduit,
    isNormal,
    isTotal,
    resultatApresIS,
    dividendeDistribuableTheorique,
  };
};

// === 3) Chaîne de dividendes (contrainte résultat + trésorerie) ===
export const computeDividends = (
  corporateTax,
  tresorerieInitiale,
  reserveMinimale,
  payroll,
  dividendRatio,
  params,
  manualDividend,
) => {
  const sortieRemuneration = payroll.coutTotalRemuneration;
  const sortieIS = corporateTax.isTotal;

  const maxParResultat = corporateTax.dividendeDistribuableTheorique;
  const maxParTresorerie = Math.max(
    0,
    tresorerieInitiale - reserveMinimale - sortieRemuneration - sortieIS,
  );

  const dividendeMaxSoutenable = Math.min(maxParResultat, maxParTresorerie);
  const cible = manualDividend != null ? manualDividend : dividendeMaxSoutenable * (dividendRatio ?? 0);
  const dividendeVerse = clamp(cible, 0, dividendeMaxSoutenable);

  const pfu = dividendeVerse * params.tauxPFU;
  const dividendeNet = dividendeVerse - pfu;

  return {
    maxParResultat,
    maxParTresorerie,
    dividendeMaxSoutenable,
    dividendeCible: cible,
    dividendeVerse,
    pfu,
    dividendeNet,
    contraintesRespectees:
      dividendeVerse <= corporateTax.dividendeDistribuableTheorique &&
      dividendeVerse <= maxParTresorerie,
  };
};

const computeIRByScale = (base, parts, bareme) => {
  const revenuParPart = Math.max(0, base) / Math.max(parts, 1);
  const lignes = [];
  let irParPart = 0;
  let tmi = 0;

  bareme.forEach((tranche, i) => {
    const assiette = Math.max(0, Math.min(revenuParPart, tranche.max) - tranche.min);
    const impot = assiette * tranche.taux;
    if (assiette > 0) tmi = tranche.taux;
    irParPart += impot;
    lignes.push({
      index: i + 1,
      min: tranche.min,
      max: tranche.max,
      taux: tranche.taux,
      assiette,
      impotParPart: impot,
    });
  });

  return { revenuParPart, irTotal: irParPart * Math.max(parts, 1), tmi, lignes };
};

// === 4) Chaîne fiscalité personnelle ===
export const computeHouseholdIncomeTax = (foyer, payroll, params) => {
  const baseRemunerationIR = payroll.netAvantIR * (1 - params.abattementSalaireIR);

  const baseImposableTotale =
    baseRemunerationIR +
    foyer.salaireConjoint +
    foyer.revenusLMNP +
    foyer.autresRevenus +
    foyer.autresRevenusImposables;

  const baseReference =
    foyer.salaireConjoint +
    foyer.revenusLMNP +
    foyer.autresRevenus +
    foyer.autresRevenusImposables;

  const simule = computeIRByScale(baseImposableTotale, foyer.parts, params.baremeIR);
  const reference = computeIRByScale(baseReference, foyer.parts, params.baremeIR);

  return {
    baseRemunerationIR,
    baseImposableTotale,
    quotientFamilial: simule.revenuParPart,
    tmi: simule.tmi,
    irTotal: simule.irTotal,
    irReference: reference.irTotal,
    surcoutIRScenario: Math.max(0, simule.irTotal - reference.irTotal),
    lignesBareme: simule.lignes,
  };
};

export const computeRetirementQuarters = (remunerationDejaVersee, remunerationBruteComplementaire, params) => {
  const remunerationAnnuelleSoumiseCotisations =
    remunerationDejaVersee + remunerationBruteComplementaire;
  const trimestresValides = Math.min(
    4,
    Math.floor(remunerationAnnuelleSoumiseCotisations / params.seuilTrimestre),
  );
  return { remunerationAnnuelleSoumiseCotisations, trimestresValides };
};

export const evaluateScenario = (
  input,
  remunerationBruteComplementaire,
  dividendRatio = 0,
  manualDividend = null,
) => {
  const payroll = computePayroll(remunerationBruteComplementaire, input.params);
  const corporateTax = computeCorporateTax(input.societe.resultatProvisoire, payroll, input.params);
  const dividends = computeDividends(
    corporateTax,
    input.societe.tresorerieDisponible,
    input.societe.reserveSecurite,
    payroll,
    dividendRatio,
    input.params,
    manualDividend,
  );
  const householdTax = computeHouseholdIncomeTax(input.foyer, payroll, input.params);
  const retraite = computeRetirementQuarters(
    input.societe.remunerationDejaVersee,
    remunerationBruteComplementaire,
    input.params,
  );

  // Chaîne trésorerie stricte
  const sortieRemuneration = payroll.coutTotalRemuneration;
  const sortieIS = corporateTax.isTotal;
  const sortieDividendes = dividends.dividendeVerse;
  const sortieTresorerieTotale = sortieRemuneration + sortieIS + sortieDividendes;
  const tresorerieFinale = input.societe.tresorerieDisponible - sortieTresorerieTotale;

  const sommeFluxTresorerie = input.societe.tresorerieDisponible - sortieTresorerieTotale;
  const coherenceTresorerieOk = Math.abs(sommeFluxTresorerie - tresorerieFinale) < 0.0001;

  const salaireNetApresIR = payroll.netAvantIR - householdTax.surcoutIRScenario;
  const netTotalFoyer = salaireNetApresIR + dividends.dividendeNet;

  const alerts = [];
  if (corporateTax.resultatFiscal < 0) alerts.push('Résultat fiscal négatif : option non admissible.');
  if (tresorerieFinale < input.societe.reserveSecurite)
    alerts.push('Réserve minimale de trésorerie non respectée.');
  if (retraite.trimestresValides < 4) alerts.push('Moins de 4 trimestres validés.');
  if (!dividends.contraintesRespectees)
    alerts.push('Dividende non conforme aux contraintes (résultat/trésorerie).');
  if (manualDividend != null && manualDividend > dividends.dividendeMaxSoutenable)
    alerts.push('Dividende manuel plafonné au maximum soutenable.');
  if (!coherenceTresorerieOk)
    alerts.push('Erreur interne : incohérence des flux de trésorerie.');

  const admissible =
    corporateTax.resultatFiscal >= 0 &&
    tresorerieFinale >= input.societe.reserveSecurite &&
    dividends.contraintesRespectees &&
    coherenceTresorerieOk;

  return {
    payroll,
    corporateTax,
    dividends,
    householdTax,
    retraite,
    // résultats consolidés
    salaireNetApresIR,
    netTotalFoyer,
    // chaîne trésorerie
    tresorerie: {
      tresorerieInitiale: input.societe.tresorerieDisponible,
      sortieRemuneration,
      sortieIS,
      sortieDividendes,
      sortieTresorerieTotale,
      tresorerieFinale,
      sommeFluxTresorerie,
      coherenceTresorerieOk,
    },
    // vue structurée chaîne résultat
    resultat: {
      resultatProvisoire: corporateTax.resultatProvisoire,
      resultatFiscal: corporateTax.resultatFiscal,
      resultatApresIS: corporateTax.resultatApresIS,
      dividendeDistribuableTheorique: corporateTax.dividendeDistribuableTheorique,
    },
    admissible,
    alerts,
  };
};

export const simulateCompensationOption = evaluateScenario;
