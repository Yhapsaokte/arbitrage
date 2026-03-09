import { pickRecommendedOptions } from './optimizer.js';
import { evaluateScenario } from './simulation.js';
import { loadState, saveState, state } from './state.js';
import { render } from './ui.js';

const root = document.getElementById('app');

const setByPath = (obj, path, value) => {
  const keys = path.split('.');
  const last = keys.pop();
  let current = obj;
  keys.forEach((k) => {
    if (!(k in current)) current[k] = {};
    current = current[k];
  });
  current[last] = value;
};

const computeResult = () => {
  const auto = pickRecommendedOptions(state);
  if (state.simulation.mode === 'automatique') return auto;

  const manual = evaluateScenario(
    state,
    state.simulation.remunerationBruteManuelle,
    0,
    state.simulation.dividendeManuelActif ? state.simulation.dividendeManuel : null,
  );

  return {
    ...auto,
    recommended: manual,
    hypotheses: [
      ...auto.hypotheses,
      'Mode manuel actif : la recommandation affichée est basée sur votre saisie personnalisée.',
      state.simulation.dividendeManuelActif
        ? 'Dividende manuel activé (avec contrôle de cohérence et plafonnement).'
        : 'Dividende manuel désactivé (dividende automatique selon contraintes).',
    ],
  };
};

const rerender = () => {
  const result = computeResult();
  render(root, state, result, (path, value) => {
    setByPath(state, path, value);
    saveState();
    rerender();
  });
};

loadState();
rerender();
