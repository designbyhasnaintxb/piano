// Builds ONE self-contained HTML file (JS, CSS, fonts, images inlined) for
// previews that can't serve a folder — e.g. opening the site in a chat panel.
// Videos stay external (they point at Lisa's current site) to keep it small.
// Usage: node scripts/build-preview.mjs [out.html]
import { build } from 'vite';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, extname } from 'node:path';

const out = process.argv[2] || 'lisa-mott-preview.html';
const dir = 'dist-preview';
await build({
  logLevel: 'warn',
  build: {
    outDir: dir, emptyOutDir: true, assetsInlineLimit: 1e9, cssCodeSplit: false, modulePreload: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});

const MIME = { '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.vtt': 'text/vtt', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const dataUri = (file) => `data:${MIME[extname(file)] || 'application/octet-stream'};base64,${readFileSync(file).toString('base64')}`;
let html = readFileSync(join(dir, 'index.html'), 'utf8');

// inline CSS and the (single) JS bundle
html = html.replace(/<link rel="stylesheet"[^>]*href="\/([^"]+)"[^>]*>/g, (_, f) => `<style>${readFileSync(join(dir, f), 'utf8')}</style>`);
html = html.replace(/<script type="module" crossorigin src="\/([^"]+)"><\/script>/g, (_, f) =>
  `<script type="module">${readFileSync(join(dir, f), 'utf8').replace(/<\/script/g, '<\\/script')}</script>`);
html = html.replace(/<link rel="modulepreload"[^>]*>/g, '');

// videos → Lisa's original files; images, captions, favicon → data URIs
const VIDEO = { '/media/wynnton-seven-of-hearts.mp4': 'https://pianolessonswithlisamott.com/video1.mp4', '/media/dexter-sibelius-romance.mp4': 'https://pianolessonswithlisamott.com/video2.mp4' };
for (const [k, v] of Object.entries(VIDEO)) html = html.replaceAll(k, v);
html = html.replace(/"webm":"[^"]*"/g, '"webm":""'); // WebM copies aren't on Lisa's site
html = html.replace(/\/(stills|media)\/[\w.-]+\.(webp|vtt)/g, (m) => dataUri(join(dir, m)));
html = html.replace('/favicon.svg', dataUri(join(dir, 'favicon.svg')));
writeFileSync(out, html);
rmSync(dir, { recursive: true, force: true });
console.log(`${out}: ${(html.length / 1e6).toFixed(2)} MB`);
