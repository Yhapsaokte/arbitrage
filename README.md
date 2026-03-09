# Arbitrage Rémunération / Dividendes SAS

Application web premium (statique modulaire) d’aide à la décision pour cabinet comptable.

## Ce que fait l’outil
- Optimise automatiquement l’arbitrage **rémunération complémentaire / dividendes**.
- Retient uniquement 3 options utiles : **recommandée**, **prudente**, **maximisation du net**.
- Explique les calculs social, fiscal, trésorerie et retraite de façon transparente.

## Navigation par onglets
- Dashboard
- Comparaison
- Flux financiers
- Cotisations sociales
- Fiscalité
- Paramètres
- Synthèse
- Annexes techniques

## Architecture
- `web/js/simulation.js` : moteur de calcul détaillé
- `web/js/optimizer.js` : moteur d’optimisation
- `web/js/ui.js` : UI + onglets + visualisations
- `web/js/constants.js` : hypothèses et paramètres
- `web/js/state.js` : persistance locale
- `web/js/main.js` : orchestration

## Démarrage
```bash
npm run lint
npm run build
npm run dev
```
Puis ouvrir `http://127.0.0.1:3000/web/`.

## Avertissement
Les résultats sont fournis à titre indicatif sur la base des hypothèses retenues et doivent être validés par un professionnel.
