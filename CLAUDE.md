# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Marketing site for Prowler Racing, a student STEM racing team. It is a dependency-free static site: `index.html`, `css/styles.css`, `js/main.js`, `assets/`. There is no package.json, build step, linter, or test suite.

## Commands

- Preview: `python3 -m http.server 8000` from the repo root, then open http://localhost:8000
- Deploy: push to `main`. `.github/workflows/pages.yml` copies `index.html css js assets` into `_site/` and publishes to GitHub Pages. Any new top-level file or folder the site needs must be added to the `cp -r` line in that workflow or it will not ship.
- Target URL is `https://prowler-racing.github.io/`, which requires the repo to be named `prowler-racing.github.io` in the `prowler-racing` org. Keep all asset and link paths relative so it also works under a sub-path.

## Architecture

- **Single page, six sections** in `index.html`, in order: hero (`#home`), story (`#story`), tiger (`#tiger`), outreach (`#outreach`), socials (`#socials`), team (`#team`), contact (`#contact`). The nav links map to these ids. `js/main.js` has a `map` object that makes the nav highlight "Our Story" while the tiger section is in view; update it if section ids change.
- **`css/styles.css` is layered, not rewritten.** The design was iterated by appending override blocks (`v4`, `v5`, `v6`, and "the only purple") to the end of the file, so earlier rules for removed designs (stickers, marquee, `.hero__bars`, checker) are still present and partly overridden. When changing a component, read the whole file, check the later blocks win, and delete dead rules rather than adding another override layer.
- **Palette** comes from team colors: orange `#FF8500`, red `#E53E4B`, purple `#A013BE`, defined as `--orange/--red/--purple`. Purple is intentionally used only for small accents (active nav underline, label shadow). Dark text on orange and red is deliberate for contrast.
- **Motion** is minimal: nav compacts on scroll, blocks fade in via IntersectionObserver (`.fade` / `.is-in`, classes added by JS), and `prefers-reduced-motion` disables it. Without JS the content must stay visible, so keep fade classes JS-applied.
- **Images are placeholders.** Every photo slot is `<div class="ph">` inside a `figure`. To use a real photo, replace the `.ph` div with an `<img>` (`.ph img` is styled to fill the frame; the hero `figure.hero__img` is full-bleed).
- **Adding content:** team members and outreach events are rendered from Sanity at deploy time by `scripts/build.mjs` into the regions between `<!-- cms:team:start/end -->` and `<!-- cms:outreach:start/end -->` in `index.html`. If Sanity has no documents (or the fetch fails) the hand-written HTML there ships unchanged. Schemas live in `studio/schemaTypes/` (project `4ste5ykk`, dataset `production`).

## Content rules (from the owner's brief)

- The story, tiger, outreach, and team text is supplied verbatim by the owner. Do not reword it.
- Do not invent team members, awards, sponsors, results, statistics, or outreach accomplishments. Missing info uses clearly labeled placeholders ("Date to be added", "Coming soon").
- Do not clone Team Nova UK's site (the stated design inspiration). Take structural ideas only; no copied text, assets, or branding.

