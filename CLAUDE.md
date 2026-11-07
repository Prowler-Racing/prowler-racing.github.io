# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Marketing site for Prowler Racing, a student STEM racing team. All page content lives in Sanity (project `4ste5ykk`, dataset `production`, Studio in `studio/`). `src/template.html` holds only markup and `{{slots}}`; `scripts/build.mjs` fetches content and writes the finished site to `_site/`. `css/` and `js/` are static. There is no linter or test suite.

## Commands

- Preview: `node scripts/build.mjs && python3 -m http.server 8000 -d _site`, then open http://localhost:8000 (content comes from live Sanity, published documents only)
- Studio: `cd studio && npm run dev`; after schema changes run `npx sanity schema deploy`, and `npx sanity deploy` to publish the hosted Studio
- Deploy: push to `main`. `.github/workflows/pages.yml` runs `scripts/build.mjs` and publishes `_site/` to GitHub Pages. New top-level static folders must be added to the copy list in `build.mjs`.
- Target URL is `https://prowler-racing.github.io/`, which requires the repo to be named `prowler-racing.github.io` in the `prowler-racing` org. Keep all asset and link paths relative so it also works under a sub-path.

## Architecture

- **Single page, seven sections** in `src/template.html`, in order: hero (`#home`), story (`#story`), tiger (`#tiger`), outreach (`#outreach`), socials (`#socials`), team (`#team`), contact (`#contact`). The nav links map to these ids. `js/main.js` has a `map` object that makes the nav highlight "Our Story" while the tiger section is in view; update it if section ids change.
- **`css/styles.css` is layered, not rewritten.** The design was iterated by appending override blocks (`v4`, `v5`, `v6`, and "the only purple") to the end of the file, so earlier rules for removed designs (stickers, marquee, `.hero__bars`, checker) are still present and partly overridden. When changing a component, read the whole file, check the later blocks win, and delete dead rules rather than adding another override layer.
- **Palette** comes from team colors: orange `#FF8500`, red `#E53E4B`, purple `#A013BE`, defined as `--orange/--red/--purple`. Purple is intentionally used only for small accents (active nav underline, label shadow). Dark text on orange and red is deliberate for contrast.
- **Motion** is minimal: nav compacts on scroll, blocks fade in via IntersectionObserver (`.fade` / `.is-in`, classes added by JS), and `prefers-reduced-motion` disables it. Without JS the content must stay visible, so keep fade classes JS-applied.
- **Images and text come from Sanity**, not the repo. Site-wide copy is the single `siteSettings` document ("Site Content"); team members and outreach events are their own document types. The build fails loudly if `siteSettings` or a required field is missing, rather than shipping a blank page. Changing which fields exist means editing `studio/schemaTypes/`, the GROQ and renderers in `build.mjs`, and the slot in the template together.
- **Adding content:** do it in the Studio, then rebuild (Run workflow in Actions, or the optional Sanity webhook sending a `sanity-publish` repository_dispatch).

## Content rules (from the owner's brief)

- The story, tiger, outreach, and team text is supplied verbatim by the owner. Do not reword it.
- Do not invent team members, awards, sponsors, results, statistics, or outreach accomplishments. Missing info uses clearly labeled placeholders ("Date to be added", "Coming soon").
- Do not clone Team Nova UK's site (the stated design inspiration). Take structural ideas only; no copied text, assets, or branding.

