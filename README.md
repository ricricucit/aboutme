# aboutme.it

[![Build, test, deploy](https://github.com/ricricucit/aboutme/actions/workflows/deploy.yml/badge.svg)](https://github.com/ricricucit/aboutme/actions/workflows/deploy.yml)

[Enrico Icardi](https://www.aboutme.it/)'s personal site. Static HTML, **no framework, no dependencies, no build tooling** beyond Node's standard library, and a hard requirement: **Lighthouse 100 in every category, on every page, mobile and desktop** — enforced by the test suite and the deploy pipeline.

## What's inside

- **One build script.** `build.mjs` (Node ≥ 18, built-ins only) renders `content/<lang>.json` into static pages, inlines all CSS, and emits `sitemap.xml` (with hreflang alternates), `robots.txt`, `llms.txt`, `llms-full.txt`, a plain-text `cv.md` per language, JSON-LD (`ProfilePage`/`Person`) and OG meta.
- **Nine languages.** English at `/`, the rest under `/<lang>/`. Adding a language = one JSON file + one line in `ORDER`.
- **~1 KB of JavaScript, inline.** Theme (system → light → dark, applied before paint) and one-time language auto-select on `/` from `navigator.languages`. No framework, no hydration, no cookies.
- **"One Day" blog.** Each post is a folder with one complete, art-directed standalone HTML document per language, copied verbatim — every post is free to look entirely different. The index and sitemap are generated.
- **LLM/GEO-ready.** `llms.txt`, `llms-full.txt` (whole site as plain text), per-language `cv.md`, rich `Person` schema with `knowsAbout`/`hasOccupation`, and a robots.txt that welcomes AI crawlers.
- **Editorial type system.** Serif display (Times stack, zero bytes) over Maison Neue text, four sizes total, half-line vertical rhythm, drop caps, sticky CV timeline with dates hanging in the margin on wide screens, light/dark via a single `light-dark()` token set.
- **Cookie-less analytics.** [GoatCounter](https://www.goatcounter.com/): one async script + a `noscript` pixel, no cookies, no consent banner needed. Set `GOATCOUNTER` in `build.mjs` ('' disables it).
- **E2E = Lighthouse.** `npm test` builds, serves, and fails unless every category is 100 on a sample of pages, mobile + desktop. GitHub Actions runs it on every push and deploys to GitHub Pages only when green.

## Commands

```sh
npm run dev     # build + serve at :5173, rebuilds on every reload — no install needed
npm run build   # one-off build to dist/
npm test        # the Lighthouse gate (needs Chrome; lighthouse comes via npx)
```

Deploy = push to `main` (repo Settings → Pages → Source: "GitHub Actions").

## Writing a One Day post

```
content/oneday/2026-09-14-my-slug/
  it.html    # a COMPLETE standalone HTML document — any design you like
  en.html    # optional translations, same idea
```

The build copies each file verbatim to `/{lang}/one-day/my-slug/`, lists it on the index (title from the file's `<title>`, date from the folder name), links untranslated languages to the Italian version, and adds it to the sitemap. Posts are not part of the Lighthouse gate — each post owns its performance.

See [CHANGELOG.md](CHANGELOG.md) for history.

## Reusing this

Take it, gut `content/*.json`, put your own life in. Two things are **not** covered by the MIT license and you must replace them:

- `src/fonts/` — Maison Neue is a commercial typeface by [Milieu Grotesque](https://www.milieugrotesque.com/); the subsets here are licensed for this site only.
- `src/img/` and everything under `content/` — Enrico's texts, portrait and blog posts. © Enrico Icardi, all rights reserved.

Everything else — the build script, the CSS system (tokens → base → components, four type sizes, half-line rhythm), the test gate, the workflow — is [MIT](LICENSE). Use it however you want.
