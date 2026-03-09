export const euro = (v) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v || 0);

export const pct = (v) => `${(v * 100).toFixed(0)} %`;

export const tmiLabel = (rate) => `${Math.round(rate * 100)} %`;
