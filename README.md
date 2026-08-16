# miriam-art

A portfolio site for a painter. Eleventy + WebC, open web standards first,
TypeScript for all the logic. Static, no CMS, no client-side framework.

## Running it

Node 24 via nvm (pinned in `.nvmrc`):

```sh
nvm use
npm install
npm run serve      # http://localhost:8080
npm run build      # typecheck, then build to _site/
npm run typecheck  # tsc --noEmit
```

Node 24 executes `.ts` files directly by stripping types, so there is **no
transpile step and no build output for the TypeScript** — Eleventy imports
`eleventy.config.ts` and `src/_data/*.ts` as they are. `tsc` is only a checker.

Because stripping never rewrites code, `enum`, `namespace`, and parameter
properties are unavailable. `erasableSyntaxOnly` in `tsconfig.json` makes the
compiler reject them rather than letting them fail at runtime.

## Structure

Designed against two references: Jérémy Rebord's Kleio site (front-page
arrangement, work-page proportions) and Daniela Keiser's site (menu hierarchy,
information-first density — with far less running text).

| Route | What it is |
|---|---|
| `/` | Full-bleed cover: one work at a time at `100dvh`, `object-fit: cover` |
| `/works/` | Every work as a gapless grid of square thumbnails |
| `/series/<name>/` | One series, same grid, with an optional intro |
| `/works/<name>/` | A single work: lead image, then further views at thirds |
| `/texts/`, `/biography/`, `/information/` | Standalone pages |
| `/specimen/` | Typeface comparison; delete once a pairing is chosen |

**Off-canvas menu, no JavaScript.** The panel is a `popover`, so the browser
handles the top layer, light-dismiss, Escape, and focus. The slide-in is a real
transition via `@starting-style` and `transition-behavior: allow-discrete` —
`overlay` is in the transition list, without which the element leaves the top
layer before the slide finishes.

**Cover slideshow, no JavaScript.** A scroll-snap track whose arrows are plain
anchors pointing at the neighbouring slide's `id`; the last slide's "next" wraps
to the first, so no arrow is ever a dead control. With CSS off it degrades to a
scrollable row of images with working links.

**Menu contents are derived, not maintained.** `src/_data/navigation.ts` holds
only the parts that cannot be computed. Series come from files in
`src/content/series/`, and each one's count is counted from the works — so the
menu cannot drift from the content.

**Series are content files, not pagination.** That gives each series a page the
artist can write on, and sidesteps an Eleventy constraint: with dynamic
permalinks disabled, a *paginated* template's permalink function is never
evaluated (`Template.js` uses the raw value, and only `renderPermalink` — reached
only when dynamic permalinks are on — resolves functions).

### Two name collisions to know about

WebC resolves shortcodes and filters *before* page data, so anything registered
under the name of a front matter field shadows that field — silently, rendering
the function's own source into the page:

- The image shortcode is `picture`, not `image`, because every work has `image`.
- There are no `year` or `dimensions` filters, because every work has both.

## What is deliberately unfinished

This is a scaffold. **The visual design is not mine to make** — it belongs to the
artist. So:

- `assets/css/theme.css` is **empty**, with only the custom-property names the
  templates read, unset. It loads last and sits in the last cascade layer, so
  anything written there wins without `!important`.
- `assets/css/layout.css` is marked `PROVISIONAL`. It exists only so pages render
  as something rather than a column of full-width images. Deleting it should break
  nothing but the arrangement.
- `assets/css/base.css` is structural only — box-sizing, focus visibility, the
  cascade layer order, and the global reduced-motion switch.

No colour palette, no type scale, no reset framework, no utility classes. Every
element carries a meaningful class name to select against.

### Cascade layers

`base.css` declares the order once, and must load first:

```css
@layer reset, base, components, layout, theme;
```

WebC component styles are wrapped into the `components` layer in `base.webc`.
Without that wrapper they would be unlayered, and unlayered styles beat every
layer — which would leave the artist fighting the scaffold.

## Adding a work

One Markdown file in `src/content/works/`. Directory data supplies the layout,
tag, and permalink, so front matter only carries content:

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
series: Interiors   # optional
order: 4            # optional; falls back to year
---
```

`types/content.ts` is the single source of truth for that shape, and
`parseWork` validates every file at build time. **A work with missing `alt` or
malformed `dimensions` fails the build**, naming the file and the field. That
validation is the main reason TypeScript earns its place in a static site.

## Images

`@11ty/eleventy-img` at build time, via the `picture` shortcode. It is named
`picture` rather than `image` because a shortcode shadows page data of the same
name, and every work has an `image` field.

- Photographs → AVIF + WebP with a JPEG fallback
- SVG sources → the vector itself, with AVIF/WebP generated behind it
- Every `<img>` gets `srcset`, `sizes`, and intrinsic `width`/`height`, so nothing
  shifts on load
- ICC colour profiles are preserved by eleventy-img, and JPEG uses 4:4:4 chroma —
  for a photograph of a painting, colour fidelity is the point

**Every graphic authored here is SVG or CSS — no PNG, no JPEG, no icon font.** The
placeholder works are SVG for that reason. Photographs of physical paintings are
the one exception, because they have no vector form.

## Typography

Nothing sets a `font-family`. Visit **`/specimen/`** to compare three pairings at
working sizes, then set `--font-display` and `--font-body` in `theme.css` and
delete the two you did not pick (files, `@font-face` blocks, and the rows in
`assets/fonts/LICENSES.md`).

All six faces are self-hosted woff2 under the Open Font License — no font CDN, no
third-party request. See `src/assets/fonts/LICENSES.md`.

## Modern web platform

Everything below is progressive enhancement — each degrades to working HTML:

| Feature | Where |
|---|---|
| `@view-transition` | index → work navigation |
| Scroll-driven animation | work grid reveal |
| Container queries | the grid responds to its container, not the viewport |
| `popover` | full-size lightbox, **zero JavaScript** |
| Speculation Rules | prerender work pages on hover |
| `@layer`, `:has()`, nesting, `color-mix()`, `@property` | available for your CSS |

The only `<script>` in the output is a declarative `speculationrules` block. The
site is fully navigable and readable with JavaScript disabled, lightbox included.

Every animation is gated on `prefers-reduced-motion`, plus a global switch in
`base.css`. That is a correctness condition, not a style choice.

Deliberately excluded: CSS masonry and the carousel pseudo-elements
(`::scroll-marker`, `::scroll-button`) — Chrome-only and still in flux.

## Deployment

GitHub Actions → GitHub Pages (`.github/workflows/deploy.yml`). CI reads
`.nvmrc`, so it cannot drift from local, and `typecheck` gates the build.

For a project page (`user.github.io/miriam-art`), set the repository variable
`PATH_PREFIX` to `/miriam-art/`. Leave it unset for a custom domain.

Internal links go through Eleventy's `url` filter and image URLs through
`src/_lib/path-prefix.ts`. Hardcoding an absolute path will work locally and 404
on a project page — the prefix is the failure mode to watch for.

## Not here yet

- **A CMS.** Deferred deliberately: on GitHub Pages, Decap would need an external
  OAuth proxy, since Pages serves static files and has no functions. Front matter
  is already Decap-shaped, so adding `admin/config.yml` later is additive.
- **Real content.** Texts, Biography and Information are stubs; the artwork is
  placeholder SVG. Swapping in photographs needs no code change.
- **Colour.** `layout.css` uses neutral fallbacks (`--page`, `--ink`, `--surface`,
  `--rule`) so pages are legible. Every one is a custom property — set them in
  `theme.css` to take it over.

## The garden

`garden-scene.webc` is an original drawing — two mismatched monobloc chairs,
banana plants, muddy grass — sharing the subject and mood of the *Debí Tirar Más
Fotos* cover, which is a copyrighted photograph and was not traced.

Since the front page became a cover, the garden appears in two places: as the
front page's **empty state** (no works published, so there is nothing to put on a
cover), and on any page with `show_garden: true` in its front matter — currently
`/information/`.

It recolours entirely from `theme.css`; `--garden-*` properties are listed there.
