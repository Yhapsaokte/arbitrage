# Arbitrage Rémunération / Dividendes SAS

Outil visuel d’aide à la décision pour cabinet comptable.

## Finalité
Calculer automatiquement l’arbitrage optimal entre **rémunération complémentaire** et **dividendes** pour un président de SAS assimilé salarié, selon un objectif métier :
- maximiser le net,
- préserver la trésorerie,
- équilibre,
- protection sociale.

## Démarrage
```bash
npm run lint
npm run build
npm run dev
```
Puis ouvrir `http://127.0.0.1:3000/web/`.

## Architecture (web statique modulaire)
- `web/js/simulation.js` : moteur de simulation (coût, IS, dividendes, IR, trésorerie, trimestres, TMI)
- `web/js/optimizer.js` : moteur d’optimisation et recommandation
- `web/js/format.js` : formatage français
- `web/js/ui.js` : rendu interface premium
- `web/js/constants.js` : hypothèses et paramètres par défaut
- `web/js/state.js` : état et persistance locale
- `web/js/main.js` : orchestration

## Restitution
L’interface affiche uniquement 3 options :
1. Option recommandée
2. Option prudente
3. Option maximisation du net

Avec comparaison visuelle, alertes métier, synthèse rédigée automatiquement et hypothèses explicites.

## Avertissement
Les résultats sont fournis à titre indicatif sur la base des hypothèses retenues et doivent être validés par un professionnel.
