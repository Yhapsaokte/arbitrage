const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const computePayroll = (remunerationBrute, params) => {
  const chargesPatronales = remunerationBrute * params.tauxPatronal;
  const chargesSalariales = remunerationBrute * params.tauxSalarial;
  const coutTotalEntreprise = remunerationBrute + chargesPatronales;
  const netAvantIR = remunerationBrute - chargesSalariales;
  return { remunerationBrute, chargesPatronales, chargesSalariales, coutTotalEntreprise, netAvantIR };
};

export const computeCorporateTax = (resultatProvisoire, payroll, params) => {
  const resultatFiscal = resultatProvisoire - payroll.remunerationBrute - payroll.chargesPatronales;
  const baseReduite = clamp(resultatFiscal, 0, params.plafondISReduit);
  const baseNormale = Math.max(0, resultatFiscal - params.plafondISReduit);
  const isReduit = baseReduite * params.tauxISReduit;
  const isNormal = baseNormale * params.tauxISNormal;
  const isTotal = isReduit + isNormal;
  const resultatApresIS = resultatFiscal - isTotal;
  return { resultatFiscal, baseReduite, baseNormale, isReduit, isNormal, isTotal, resultatApresIS };
};

export const computeDividends = (corporateTax, tresorerieDisponible, reserveSecurite, payroll, dividendRatio, params, manualDividend) => {
  const distribuableTheorique = Math.max(0, corporateTax.resultatApresIS);
  const capaciteTresorerie = Math.max(0, tresorerieDisponible - reserveSecurite - payroll.coutTotalEntreprise);
  const dividendeMaxSoutenable = Math.min(distribuableTheorique, capaciteTresorerie);
  const dividendeCible = manualDividend != null ? manualDividend : dividendeMaxSoutenable * (dividendRatio ?? 0);
  const dividendeVerse = clamp(dividendeCible, 0, dividendeMaxSoutenable);
  const pfu = dividendeVerse * params.tauxPFU;
  const netDividendes = dividendeVerse - pfu;
  return { distribuableTheorique, capaciteTresorerie, dividendeMaxSoutenable, dividendeVerse, pfu, netDividendes, dividendeCible };
};

const computeIRByScale = (base, parts, bareme) => {
  const revenuParPart = Math.max(0, base) / Math.max(parts, 1);
  const lignes = [];
  let irParPart = 0;
  let tmi = 0;
  bareme.forEach((t, i) => {
    const assiette = Math.max(0, Math.min(revenuParPart, t.max) - t.min);
    const impot = assiette * t.taux;
    if (assiette > 0) tmi = t.taux;
    irParPart += impot;
    lignes.push({ index: i + 1, min: t.min, max: t.max, taux: t.taux, assiette, impotParPart: impot });
  });
  return { revenuParPart, irParPart, irTotal: irParPart * Math.max(parts, 1), tmi, lignes };
};

export const computeHouseholdIncomeTax = (foyer, payroll, params) => {
  const baseRemunerationImposable = payroll.netAvantIR * (1 - params.abattementSalaireIR);
  const baseFoyerTotale =
    foyer.autresRevenus + foyer.revenusLMNP + foyer.salaireConjoint + foyer.autresRevenusImposables + baseRemunerationImposable;
  const baseReference = foyer.autresRevenus + foyer.revenusLMNP + foyer.salaireConjoint + foyer.autresRevenusImposables;

  const simule = computeIRByScale(baseFoyerTotale, foyer.parts, params.baremeIR);
  const reference = computeIRByScale(baseReference, foyer.parts, params.baremeIR);

  return {
    baseRemunerationImposable,
    baseFoyerTotale,
    baseReference,
    quotientFamilial: simule.revenuParPart,
    irTotal: simule.irTotal,
    irReference: reference.irTotal,
    irAdditionnel: Math.max(0, simule.irTotal - reference.irTotal),
    tmi: simule.tmi,
    lignesBareme: simule.lignes,
  };
};

export const computeRetirementQuarters = (remunerationDejaVersee, remunerationBrute, params) => {
  const remunerationAnnuelleSoumise = remunerationDejaVersee + remunerationBrute;
  const trimestresValides = Math.min(4, Math.floor(remunerationAnnuelleSoumise / params.seuilTrimestre));
  return { remunerationAnnuelleSoumise, trimestresValides };
};

export const evaluateScenario = (input, remunerationBrute, dividendRatio = 0, manualDividend = null) => {
  const payroll = computePayroll(remunerationBrute, input.params);
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
  const retraite = computeRetirementQuarters(input.societe.remunerationDejaVersee, remunerationBrute, input.params);

  const salaireNetApresIR = payroll.netAvantIR - householdTax.irAdditionnel;
  const netTotalFoyer = salaireNetApresIR + dividends.netDividendes;
  const sortieTresorerie = payroll.coutTotalEntreprise + dividends.dividendeVerse;
  const tresorerieRestante = input.societe.tresorerieDisponible - sortieTresorerie;

  const fluxRepartition = {
    salaireBrut: payroll.remunerationBrute,
    chargesPatronales: payroll.chargesPatronales,
    is: corporateTax.isTotal,
    dividendes: dividends.dividendeVerse,
  };

  const alerts = [];
  if (corporateTax.resultatFiscal < 0) alerts.push('Rémunération trop élevée au regard du résultat.');
  if (tresorerieRestante < 0) alerts.push('Trésorerie négative : option non admissible.');
  if (tresorerieRestante < input.societe.reserveSecurite) alerts.push('Réserve minimale non respectée.');
  if (retraite.trimestresValides < 4) alerts.push('Moins de 4 trimestres validés.');
  if (dividends.dividendeVerse <= 0) alerts.push('Pas de dividendes versés dans cette option.');
  if (householdTax.irAdditionnel > 5000) alerts.push('Augmentation sensible de l’IR estimatif.');
  if (manualDividend != null && manualDividend > dividends.dividendeMaxSoutenable) alerts.push('Dividende manuel plafonné au maximum soutenable.');

  const admissible = corporateTax.resultatFiscal >= 0 && tresorerieRestante >= input.societe.reserveSecurite;

  return {
    remunerationBrute,
    dividendRatio,
    payroll,
    corporateTax,
    dividends,
    householdTax,
    retraite,
    salaireNetApresIR,
    netTotalFoyer,
    sortieTresorerie,
    tresorerieRestante,
    fluxRepartition,
    admissible,
    alerts,
  };
};

export const simulateCompensationOption = evaluateScenario;
