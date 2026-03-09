import { mkdirSync, cpSync } from 'node:fs';

mkdirSync('dist', { recursive: true });
cpSync('web', 'dist', { recursive: true });
console.log('Build statique OK -> dist/');
