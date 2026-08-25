# miriam-art

A portfolio site for a painter. Eleventy + WebC, static, no client-side framework.

```sh
nvm use
pnpm install
pnpm run serve
```

## Content

Works live in `src/content/works/`, one Markdown file each, and are grouped by
`section` — `painting`, `sculpture` or `video`. Layout, tag and permalink come
from directory data, so front matter carries only content:

```yaml
---
title: Untitled III
section: painting
image: src/assets/works/painting/untitled-iii/untitled-iii.jpg
alt: A description of the painting, for anyone who cannot see it.
year: 2026
medium: oil on linen
dimensions:
  height_cm: 200
  width_cm: 150
---
```

`title`, `section`, `image` and `alt` are required; everything else is optional,
because the source material arrived without metadata. Add further views with an
`images:` list of `src`/`alt` pairs, each with an optional `group`, and a video
with `video:` (`mp4`, `poster`, `poster_alt`).

A missing `alt` **fails the build**, naming the file and the field.

**Content still owed.** Alt text is currently derived from filenames rather than
written, and no work has a year, medium or dimensions — the source material
arrived without them. A filename is not a description, so the site is weaker for
anyone using a screen reader until those are written.

Section pages come from `src/content/sections/`, standalone pages from
`src/content/pages/`. A page with `show_garden: true` renders the garden drawing.

## Importing from design-spec

`design-spec/` holds the artist's originals and is gitignored. Two scripts turn
it into committed, web-ready assets, and both are committed with their output so
the result is reproducible:

```sh
node scripts/import-design-spec.ts   # works: resize to 2400px, derive .md files
node scripts/build-favicon.ts        # trace the mark to favicon.svg + touch icon
```

Video is transcoded by hand, on demand, and the result committed:

```sh
ffmpeg -i input.mov -vf scale=1280:-2 -an \
  -c:v libx264 -crf 34 -preset slow -movflags +faststart out.mp4
ffmpeg -ss 1 -i input.mov -vframes 1 -vf scale=1280:-2 -q:v 4 out-poster.jpg
```

MP4 only. VP9/WebM measured larger than H.264 at matching quality, so a second
format added weight without benefit.

## Design

Colour comes from `design-spec/design/color-palette.png`: paper, sand, lime, sage
and ink. Only ink is legible as text — the other four are surfaces, accents and
rules — so `--ink-muted` is a derived `#4b5a4a` rather than the sage itself.

Two faces, per the brief: one plain, one flowing. Body text is **Istok Web**, a
plain sans with no decorative glyphs. Headings are **Fraunces**, a soft old-style
serif run at `SOFT 60, WONK 1` so it flows rather than sits upright. Both are set
in `theme.css` via `--font-body`, `--font-display` and `--font-display-settings`.

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
