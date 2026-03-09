import { DEFAULT_INPUT } from './constants.js';

const KEY = 'arbitrage-sas-optimizer-v1';

const clone = (obj) => JSON.parse(JSON.stringify(obj));

export const state = clone(DEFAULT_INPUT);

export const loadState = () => {
  const raw = localStorage.getItem(KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);
  } catch {
    // ignore
  }
};

export const saveState = () => localStorage.setItem(KEY, JSON.stringify(state));
