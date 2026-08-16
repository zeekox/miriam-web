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
- **About / CV / contact pages.** `src/content/pages/` and `page.webc` are ready.
- **Real artwork.** Placeholders are SVG; swapping in photographs needs no code
  change.
