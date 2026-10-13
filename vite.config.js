import { defineConfig } from 'vite';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

// Renders every section into static HTML from content/site.js at dev & build time.
function contentPages() {
  const load = async () => {
    const bust = `?t=${Date.now()}`;
    const site = (await import(pathToFileURL(resolve('content/site.js')).href + bust)).default;
    const { renderPage } = await import(pathToFileURL(resolve('src/templates.js')).href + bust);
    return renderPage(site);
  };
  let command = 'serve';
  return {
    name: 'content-pages',
    configResolved(cfg) { command = cfg.command; },
    async transformIndexHtml(html) {
      const page = await load();
      if (command === 'build' && page.nFacts && !process.env.ALLOW_PLACEHOLDERS) {
        throw new Error(`${page.nFacts} content facts are still empty. Fill content/site.js (npm run check:content) or build with ALLOW_PLACEHOLDERS=1 for a review build.`);
      }
      return html
        .replaceAll('%TITLE%', page.title)
        .replaceAll('%DESCRIPTION%', page.description)
        .replaceAll('%URL%', page.url)
        .replace('%BODY%', page.body);
    },
    handleHotUpdate({ file, server }) {
      if (file.includes('/content/') || file.endsWith('templates.js')) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

export default defineConfig({
  plugins: [contentPages()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
  },
});
