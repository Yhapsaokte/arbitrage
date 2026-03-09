import { mkdirSync, copyFileSync } from 'node:fs';
mkdirSync('dist', { recursive: true });
copyFileSync('web/index.html', 'dist/index.html');
copyFileSync('web/styles.css', 'dist/styles.css');
copyFileSync('web/app.js', 'dist/app.js');
console.log('Build statique OK -> dist/');
