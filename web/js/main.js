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
      'Mode manuel actif : calcul basé sur la rémunération et le dividende saisis.',
    ],
  };
};

let rerenderTimer;
const rerender = () => {
  clearTimeout(rerenderTimer);
  rerenderTimer = setTimeout(() => {
    const y = window.scrollY;
    const result = computeResult();
    render(root, state, result, (path, value) => {
      setByPath(state, path, value);
      saveState();
      rerender();
    });
    window.scrollTo({ top: y, behavior: 'auto' });
  }, 20);
};

loadState();
rerender();
