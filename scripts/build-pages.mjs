import {spawnSync} from 'node:child_process';
import {cp, mkdir, readdir, rm, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

// Reuse the exact React workbench without a server; the local Vinext stays unchanged.
const result = spawnSync(process.execPath, [fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url)), 'build', '--config', 'vite.pages.config.ts'], {
  stdio: 'inherit', env: {...process.env},
});
if (result.status !== 0) process.exit(result.status ?? 1);
const folder = new URL('../out-pages/dossier/', import.meta.url);
// Vite copies public automatically, including local originals. Replace only export copies.
for (const file of await readdir(folder)) if (file.endsWith('.mp4')) await rm(new URL(file, folder));
await mkdir(folder, {recursive: true});
for (let channel = 1; channel <= 5; channel++) {
  await cp(new URL(`../pages-media/ai-channel-${channel}.mp4`, import.meta.url), new URL(`ai-channel-${channel}.mp4`, folder));
}
await writeFile(new URL('../out-pages/.nojekyll', import.meta.url), '');
console.log('GitHub Pages export ready in out-pages/');
