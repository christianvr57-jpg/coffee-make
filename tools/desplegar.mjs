// Compila y publica dist/ en la rama gh-pages (GitHub Pages). Uso: npm run desplegar
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const dist = fileURLToPath(new URL('../dist', import.meta.url));
const sh = (cmd, cwd = raiz) => execSync(cmd, { cwd, stdio: 'inherit' });
const leer = (cmd) => execSync(cmd, { cwd: raiz }).toString().trim();

sh('npm test');
sh('npm run build');
writeFileSync(`${dist}/.nojekyll`, '');

const remoto = leer('git remote get-url origin');
const nombre = leer('git config user.name');
const correo = leer('git config user.email');
const version = leer('git rev-parse --short HEAD');

sh('git init -q -b gh-pages', dist);
sh(`git config user.name "${nombre}"`, dist);
sh(`git config user.email "${correo}"`, dist);
sh('git add -A', dist);
sh(`git commit -q -m "Publicación de ${version}"`, dist);
sh(`git push -f "${remoto}" gh-pages`, dist);
console.log('\nPublicado. GitHub Pages tarda 1-2 minutos en actualizarse.');
