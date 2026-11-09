import { mkdir, rm, copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const dest = resolve(root, 'dist');
const files = ['index.html','styles.css','app.js','learning.js','detailed-demos.js','tsp-engine.js','logo_utec.png','results/berlin52.tsp','results/eil51.tsp'];
await rm(dest, {recursive:true, force:true});
for (const file of files) { const target=resolve(dest,file); await mkdir(dirname(target),{recursive:true}); await copyFile(resolve(root,file),target); }
console.log(`Built ${files.length} files in dist/`);
