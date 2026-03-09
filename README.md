# Arbitrage Rémunération SAS

Application web visuelle (en français) de simulation d’arbitrage de rémunération de fin d’exercice d’un président de SAS assimilé salarié.

## Démarrage rapide (sans dépendances externes)
```bash
npm run lint
npm run build
npm run dev
```
Puis ouvrir `http://127.0.0.1:3000/web/`.

## Pourquoi ce mode
L’environnement courant bloque l’accès au registre npm (403). Cette version est donc livrée en **mode statique autonome** :
- aucune dépendance npm à installer,
- exécution immédiate,
- moteur de calcul paramétrable côté front,
- persistance locale (`localStorage`).

## Modules inclus
- Dashboard
- Dossier / paramètres généraux
- Paramètres de calcul (modifiables)
- Création de scénarios
- Comparaison multi-scénarios + scénario recommandé
- Visualisations
- Synthèse imprimable
- Annexes techniques

## Avertissement
Les résultats sont fournis à titre indicatif sur la base des hypothèses retenues et doivent être validés par un professionnel.
