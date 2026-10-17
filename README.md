<div align="center">

# The NoVibe Manifesto

### Be the driver, not the passenger.

Source for **[novibe.org](https://novibe.org)** — the manifesto site.

[![Astro](https://img.shields.io/badge/built_with-Astro-bc52ee?style=flat-square)](https://astro.build)

</div>

---

AI made writing code cheap. The work that matters — deciding what to build, designing it,
proving it right, keeping it alive — didn't change. Vibe coding sells the comforting lie that
the typing *was* the work. NoVibe is the refusal: shape the work, own it from intent to ship.

This repo is the [Astro](https://astro.build) site that publishes the manifesto.

## Develop

Requires Node ≥ 22.12.

```sh
npm install
npm run dev        # local dev server at http://localhost:4321
npm run build      # production build → ./dist/
npm run preview    # preview the build locally
```

The build also writes [`/llms.txt`](https://novibe.org/llms.txt) and [`/llms-full.txt`](https://novibe.org/llms-full.txt)
([llmstxt.org](https://llmstxt.org)) from the built pages — see `llms-txt.mjs`. Edit the pages, never the files.

## Related

- **[novibe](https://github.com/novibe-org/novibe)**: the NoVibe method as a Claude Code plugin. You decide the Gherkin spec and the C4 design, Claude builds test-first until the spec passes.
