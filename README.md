# miriam-art

A portfolio site for a painter. Eleventy + WebC, static, no client-side framework.

```sh
nvm use
npm install
npm run serve
```

## Adding a work

One Markdown file in `src/content/works/`. Layout, tag and permalink come from
directory data, so front matter carries only content:

```yaml
---
title: Untitled III
year: 2026
medium: oil on linen
dimensions:
  height_cm: 200
  width_cm: 150
image: src/assets/works/untitled-iii.jpg
alt: A description of the painting, for anyone who cannot see it.
series: Interiors
order: 4
---
```

`series` and `order` are optional; ordering falls back to `year`. Add further
views with an `images:` list of `src`/`alt` pairs.

A missing `alt` or malformed `dimensions` **fails the build**, naming the file and
the field.

Series pages come from files in `src/content/series/`, standalone pages from
`src/content/pages/`. A page with `show_garden: true` renders the garden drawing.

## Design

Body text is Istok Web, headings Work Sans, set as `--font-body` and
`--font-display` in `theme.css` — the only two lines that choose a typeface.

Laid out against two references: Jérémy Rebord's Kleio site for the cover and
work-page proportions, Daniela Keiser's for the menu hierarchy.

`garden-scene.webc` is an original drawing sharing the subject and mood of the
*Debí Tirar Más Fotos* cover, which is a copyrighted photograph and was not
traced.

## Status

The artwork is placeholder SVG, and Texts, Biography and Information are stubs;
swapping in real content needs no code change.

There is no CMS. On GitHub Pages that would need an external OAuth proxy, since
Pages has no functions. Front matter is already Decap-shaped, so adding one later
is additive.

## Elsewhere

- [CLAUDE.md](CLAUDE.md) — commands, architecture, conventions, WebC constraints
- [DEPLOY.md](DEPLOY.md) — GitHub Pages setup and troubleshooting
- [src/assets/fonts/LICENSES.md](src/assets/fonts/LICENSES.md) — bundled typefaces
