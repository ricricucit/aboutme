# aboutme.it

[![Build, test, deploy](https://github.com/ricricucit/aboutme/actions/workflows/deploy.yml/badge.svg)](https://github.com/ricricucit/aboutme/actions/workflows/deploy.yml)

[Enrico Icardi](https://www.aboutme.it/)'s personal site. Static HTML, **no framework, no dependencies, no build tooling** beyond Node's standard library, and a hard requirement: **Lighthouse 100 in every category, on every page, mobile and desktop** — enforced by the test suite and the deploy pipeline.

## Latest essay

[![I was “just” a CMS developer. Then came AI](https://www.aboutme.it/share/en-2026-11-02-cms-is-dead-long-live-the-cms-2173395a02ff.png)](https://www.aboutme.it/one-day/2026-11-02-cms-is-dead-long-live-the-cms/)

**[I was “just” a CMS developer. Then came AI](https://www.aboutme.it/one-day/2026-11-02-cms-is-dead-long-live-the-cms/)**

Twenty years of CMS work, the anatomy of Directus, and what data, permissions and recovery mean when people build software with AI. Includes the strongest case for removing the CMS altogether.

[Read in English](https://www.aboutme.it/one-day/2026-11-02-cms-is-dead-long-live-the-cms/) · [Leggi in italiano](https://www.aboutme.it/it/one-day/2026-11-02-cms-is-dead-long-live-the-cms/) · Seven more translations in the article.

## What's inside

- **One build script.** `build.mjs` (Node ≥ 18, built-ins only) renders `content/<lang>.json` into static pages, inlines all CSS, and emits `sitemap.xml` (with hreflang alternates), `robots.txt`, `llms.txt`, `llms-full.txt`, a plain-text `cv.md` per language, JSON-LD (`ProfilePage`/`Person`) and OG meta.
- **Nine languages.** English at `/`, the rest under `/<lang>/`. Adding a language = one JSON file + one line in `ORDER`.
- **~1 KB of JavaScript, inline.** Theme (system → light → dark, applied before paint) and one-time language auto-select on `/` from `navigator.languages`. No framework, no hydration, no cookies.
- **"One Day" blog.** Each post is a folder with one complete, art-directed standalone HTML document per language, published with its own editorial design. The build adds social metadata and lightweight reading tools; the index and sitemap are generated.
- **Reading tools.** A mobile-first sticky contents menu, section deep links, progress indicator, back-to-top link and estimated reading time calculated from each translation at 200 words/minute. Native disclosure and anchor links work without JavaScript.\n- **Dynamic share covers.** Each page and translated post gets its own 1200 × 630 PNG, generated from its title and description. Post illustrations are reused when available; otherwise deterministic mathematical curves provide the artwork. Image URLs include a content hash. A preview gallery lives at `/share/` (noindex).\n- **LLM/GEO-ready.** `llms.txt`, `llms-full.txt` (whole site as plain text), per-language `cv.md`, rich `Person` schema with `knowsAbout`/`hasOccupation`, and a robots.txt that welcomes AI crawlers.
- **Editorial type system.** Serif display (Times stack, zero bytes) over Maison Neue text, four sizes total, half-line vertical rhythm, drop caps, sticky CV timeline with dates hanging in the margin on wide screens, light/dark via a single `light-dark()` token set.
- **Cookie-less analytics.** [GoatCounter](https://www.goatcounter.com/): one async script + a `noscript` pixel, no cookies, no consent banner needed. Set `GOATCOUNTER` in `build.mjs` ('' disables it).
- **E2E = Lighthouse.** `npm test` builds, serves, and fails unless every category is 100 on a sample of pages, mobile + desktop. GitHub Actions runs it on every push and deploys to GitHub Pages only when green.

## Commands

```sh
npm run dev     # build + serve at :5173, rebuilds on every reload — no install needed
npm run build   # one-off build to dist/
npm test        # feature checks + Lighthouse; then renders/checks all share PNGs\nnpm run share:render  # render cards after a build (Chrome required; no npm dependencies)
```

Share templates and a manifest are written by `npm run build`. The `posttest` lifecycle renders them with the same Chrome used for Lighthouse, verifies dimensions and text fit, and stops deployment if a card fails. Run `npm run share:render` after a local build when you need the complete share-image output. Set `CHROME_PATH` if Chrome is not on PATH.\n\nDeploy = push to `main` (repo Settings → Pages → Source: "GitHub Actions").

## Writing a One Day post

```
content/oneday/2026-09-14-my-slug/
  it.html    # a COMPLETE standalone HTML document — any design you like
  en.html    # optional translations, same idea
```

The build preserves each document’s design, adds sharing metadata and reading tools, and publishes it at `/{lang}/one-day/my-slug/`, lists it on the index (title from the file's `<title>`, date from the folder name), links untranslated languages to the Italian version, and adds it to the sitemap. Posts are not part of the Lighthouse gate — each post owns its performance.

See [CHANGELOG.md](CHANGELOG.md) for history.

## Reusing this

Take it, gut `content/*.json`, put your own life in. Two things are **not** covered by the MIT license and you must replace them:

- `src/fonts/` — Maison Neue is a commercial typeface by [Milieu Grotesque](https://www.milieugrotesque.com/); the subsets here are licensed for this site only.
- `src/img/` and everything under `content/` — Enrico's texts, portrait and blog posts. © Enrico Icardi, all rights reserved.

Everything else — the build script, the CSS system (tokens → base → components, four type sizes, half-line rhythm), the test gate, the workflow — is [MIT](LICENSE). Use it however you want.
