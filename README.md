# Arbitrage Rémunération / Dividendes SAS

Application web premium (statique modulaire) d’aide à la décision pour cabinet comptable.

## Points clés
- Optimisation automatique de l’arbitrage rémunération/dividendes.
- Simulation manuelle pilotée par l’utilisateur (rémunération + dividende manuel optionnel).
- 3 options utiles uniquement : recommandée, prudente, maximisation du net.
- Calculs détaillés et transparents : social, IS, IR, dividendes, trésorerie, retraite.

## Interface
Navigation par onglets :
- Entrées
- Dashboard
- Comparaison
- Flux financiers
- Cotisations sociales
- Fiscalité
- Paramètres
- Synthèse
- Annexes techniques

## Entrées éditables (sans coder)
- Société : raison sociale, exercice, activité, résultat provisoire, trésorerie, rémunération déjà versée, réserve minimale.
- Foyer : parts, salaire conjoint, revenus LMNP, autres revenus.
- Simulation : objectif, mode automatique/manuel, rémunération brute manuelle, dividende manuel.

## Démarrage
```bash
npm run lint
npm run build
npm run dev
```
Puis ouvrir `http://127.0.0.1:3000/web/`.

## Avertissement
Les résultats sont fournis à titre indicatif sur la base des hypothèses retenues et doivent être validés par un professionnel.
