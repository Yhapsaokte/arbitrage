const computeIS = (resultatFiscal, params) => {
  if (resultatFiscal <= 0) return 0;
  return (
    Math.min(resultatFiscal, params.plafondISReduit) * params.tauxISReduit +
    Math.max(0, resultatFiscal - params.plafondISReduit) * params.tauxISNormal
  );
};

const computeIRAndTMI = (baseTotale, parts, bareme) => {
  const parPart = Math.max(0, baseTotale) / Math.max(1, parts);
  let irParPart = 0;
  let tmi = 0;
  bareme.forEach((tranche) => {
    const assiette = Math.max(0, Math.min(parPart, tranche.max) - tranche.min);
    if (assiette > 0) tmi = tranche.taux;
    irParPart += assiette * tranche.taux;
  });
  return { ir: irParPart * Math.max(1, parts), tmi };
};

export const simulateCombination = (input, remunerationBrute, dividendRatio) => {
  const { societe, foyer, params } = input;
  const cp = remunerationBrute * params.tauxPatronal;
  const cs = remunerationBrute * params.tauxSalarial;
  const coutRem = remunerationBrute + cp;
  const netRemAvantIR = remunerationBrute - cs;

  const resFiscal = societe.resultatProvisoire - remunerationBrute - cp;
  const isEstime = computeIS(resFiscal, params);
  const resApresIS = resFiscal - isEstime;
  const divMaxJuridique = Math.max(0, resApresIS);

  const capaciteTresoPourDiv = Math.max(
    0,
    societe.tresorerieDisponible - societe.reserveSecurite - coutRem,
  );
  const divMaxSoutenable = Math.min(divMaxJuridique, capaciteTresoPourDiv);
  const dividendesVerses = Math.max(0, divMaxSoutenable * dividendRatio);
  const netDividendes = dividendesVerses * (1 - params.tauxPFU);

  const baseRemIR = netRemAvantIR * (1 - params.abattementSalaireIR);
  const baseTotale =
    foyer.autresRevenus +
    foyer.revenusLMNP +
    foyer.salaireConjoint +
    foyer.autresRevenusImposables +
    baseRemIR;

  const baseSansSimulation =
    foyer.autresRevenus + foyer.revenusLMNP + foyer.salaireConjoint + foyer.autresRevenusImposables;

  const irTotal = computeIRAndTMI(baseTotale, foyer.parts, params.baremeIR);
  const irReference = computeIRAndTMI(baseSansSimulation, foyer.parts, params.baremeIR);
  const surcoutIR = Math.max(0, irTotal.ir - irReference.ir);

  const sortieTresorerie = coutRem + dividendesVerses;
  const tresorerieRestante = societe.tresorerieDisponible - sortieTresorerie;
  const remAnnuelle = societe.remunerationDejaVersee + remunerationBrute;
  const trimestres = Math.min(4, Math.floor(remAnnuelle / params.seuilTrimestre));

  const netFinal = netRemAvantIR + netDividendes - surcoutIR;

  const alerts = [];
  if (resFiscal < 0) alerts.push('Rémunération trop élevée au regard du résultat provisoire.');
  if (tresorerieRestante < 0) alerts.push('Trésorerie négative : option non soutenable.');
  if (tresorerieRestante >= 0 && tresorerieRestante < params.seuilTresorerieResiduelle) alerts.push('Trésorerie résiduelle faible : vigilance cabinet.');
  if (trimestres < 4) alerts.push('4 trimestres non validés : protection sociale incomplète.');
  if (divMaxJuridique <= 0) alerts.push('Absence de dividendes distribuables sur la base des hypothèses.');
  if (surcoutIR > 6000) alerts.push('Hausse sensible de l’IR estimatif du foyer.');
  if (dividendesVerses > 0 && remunerationBrute < 5000) alerts.push('Option potentiellement agressive fiscalement (forte part dividendes).');

  return {
    remunerationBrute,
    chargesPatronales: cp,
    chargesSalariales: cs,
    coutTotalSociete: coutRem,
    netRemunerationAvantIR: netRemAvantIR,
    resultatFiscalAvantIS: resFiscal,
    isEstime,
    resultatApresIS: resApresIS,
    dividendesDistribuablesMax: divMaxJuridique,
    dividendesVerses,
    netDividendes,
    irFoyerTotal: irTotal.ir,
    irAdditionnelSimulation: surcoutIR,
    netFinal,
    sortieTresorerie,
    tresorerieRestante,
    trimestresValides: trimestres,
    tmi: irTotal.tmi,
    admissible: resFiscal >= 0 && tresorerieRestante >= 0,
    alerts,
  };
};
