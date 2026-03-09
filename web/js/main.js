import { pickRecommendedOptions } from './optimizer.js';
import { loadState, saveState, state } from './state.js';
import { render } from './ui.js';

const root = document.getElementById('app');

const setByPath = (obj, path, value) => {
  const keys = path.split('.');
  const last = keys.pop();
  let current = obj;
  keys.forEach((k) => {
    current = current[k];
  });
  current[last] = value;
};

const rerender = () => {
  const result = pickRecommendedOptions(state);
  render(root, state, result, (path, value) => {
    setByPath(state, path, value);
    saveState();
    rerender();
  });
};

loadState();
rerender();
