// Writes /llms.txt and /llms-full.txt (https://llmstxt.org) from the built pages, so they say
// what the site says and cannot drift from it.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';
import { NodeHtmlMarkdown } from 'node-html-markdown';

// Every built page is listed; these go under Optional, which a model may skip when its context is short.
const optional = ['/legal', '/privacy'];

const read = async (dir, site, path) => {
  const file = new URL(path === '/' ? 'index.html' : `${path.slice(1)}/index.html`, dir);
  const html = parse(await readFile(file, 'utf8'));
  const main = html.querySelector('main');
  // Decoration is hidden from screen readers; it is noise to a language model too.
  main.querySelectorAll('[aria-hidden="true"], style, script, img').forEach((n) => n.remove());
  // Chips and tool names are spans side by side; without a separator they run together.
  main.querySelectorAll('span').forEach((n) => n.insertAdjacentHTML('afterend', ' '));
  // A model reads the file out of context, so every link has to work on its own.
  main.querySelectorAll('a[href^="/"]').forEach((a) => a.setAttribute('href', site + a.getAttribute('href')));
  const repos = main
    .querySelectorAll('section')
    .flatMap((s) => {
      // A product card links its repository; a pull request or an issue is no product.
      const href = s.querySelectorAll('a').map((a) => a.getAttribute('href')).find((h) => /^https:\/\/github\.com\/novibe-org\/[^/]+$/.test(h));
      const h = s.querySelector('h2');
      return href && h ? [{ href, name: href.split('/').slice(3).join('/'), what: h.text.trim() }] : [];
    });
  return {
    title: html.querySelector('title').text.trim(),
    description: html.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    repos,
    body: NodeHtmlMarkdown.translate(main.innerHTML).trim(),
  };
};

export default function llmsTxt() {
  let site;
  return {
    name: 'llms-txt',
    hooks: {
      'astro:config:done': ({ config }) => {
        site = config.site.replace(/\/$/, '');
      },
      'astro:build:done': async ({ dir, pages }) => {
        const paths = pages
          .map((p) => `/${p.pathname.replace(/\/$/, '')}`)
          .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));
        const read_ = await Promise.all(
          paths.map(async (path) => ({ path, section: optional.includes(path) ? 'Optional' : 'Manifesto', ...(await read(dir, site, path)) })),
        );
        const [home] = read_;
        const practice = read_.find((p) => p.path === '/practice');
        // A page without a description of its own carries the home page's; say nothing rather than repeat it.
        const list = (section) =>
          read_
            .filter((p) => p.section === section)
            .map((p) => `- [${p.title}](${site}${p.path})${p.path === '/' || p.description !== home.description ? `: ${p.description}` : ''}`)
            .join('\n');
        const repos = read_
          .flatMap((p) => p.repos)
          .map((r) => `- [${r.name}](${r.href}): ${r.what}`)
          .join('\n');

        const index = [
          `# NoVibe`,
          `> ${home.description}`,
          `${practice.description} The full text of every page is at ${site}/llms-full.txt.`,
          `## Manifesto\n\n${list('Manifesto')}`,
          `## Code\n\n${repos}`,
          `## Optional\n\n${list('Optional')}`,
        ].join('\n\n');

        const full = [
          `# NoVibe`,
          `> ${home.description}`,
          ...read_.map((p) => `---\n\nSource: ${site}${p.path}\n\n${p.body}`),
        ].join('\n\n');

        await writeFile(fileURLToPath(new URL('llms.txt', dir)), `${index}\n`);
        await writeFile(fileURLToPath(new URL('llms-full.txt', dir)), `${full}\n`);
      },
    },
  };
}
