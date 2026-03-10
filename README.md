# Arbitrage Rémunération / Dividendes SAS

Application web premium (statique modulaire) d’aide à la décision pour cabinet comptable.

## Priorités de cette version
- Cohérence économique stricte avec séparation des 4 chaînes :
  1. résultat comptable/fiscal,
  2. dividende distribuable,
  3. trésorerie,
  4. fiscalité personnelle.
- Formulaire d’entrées entièrement éditable.
- Deux modes explicites : automatique / manuel.
- Contrôles de cohérence (dividendes contraints + vérification interne trésorerie).

## Interface
Navigation par onglets : Entrées, Dashboard, Comparaison, Flux financiers, Cotisations sociales, Fiscalité, Paramètres, Synthèse, Annexes techniques.

## Démarrage
```bash
npm run lint
npm run build
npm run dev
```
Puis ouvrir `http://127.0.0.1:3000/web/`.

## Avertissement
Les résultats sont fournis à titre indicatif sur la base des hypothèses retenues et doivent être validés par un professionnel.
