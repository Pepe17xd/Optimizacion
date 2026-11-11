import { mkdir, rm, copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dest = resolve(root, 'dist');
const files = ['index.html','src/css/styles.css','src/js/app.js','src/js/config.js','src/js/learning.js','src/js/detailed-demos.js','src/js/tsp-engine.js','public/assets/logo_utec.png','public/assets/data/berlin52.tsp','public/assets/data/eil51.tsp'];
await rm(dest, {recursive:true, force:true});
for (const file of files) { const target=resolve(dest,file); await mkdir(dirname(target),{recursive:true}); await copyFile(resolve(root,file),target); }
console.log(`Built ${files.length} files in dist/`);
