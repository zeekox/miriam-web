# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A portfolio site for a painter. Eleventy 3 + WebC, static, no client-side
framework. `README.md` is deliberately minimal (what it is, adding a work);
`DEPLOY.md` covers shipping. Everything else belongs here.

## Commands

Node comes from **nvm**, which does not load in non-interactive shells — `node`
will appear missing when it is not. Prefix every command:

```sh
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 24
```

Never install Node via Homebrew.

```sh
npm run serve      # dev server, http://localhost:8080
npm run build      # typecheck, then build to _site/
npm run typecheck  # tsc --noEmit

PATH_PREFIX=/miriam-art/ npx eleventy --config=eleventy.config.ts
```

The last one reproduces a GitHub Pages *project page* build. Prefix bugs are
invisible in a default build and 404 every asset once deployed.

There is **no test suite**. The equivalents are `typecheck` and the content
validation below — a work with bad front matter fails the build by design. To
check that guard still works, delete an `alt:` from a file in
`src/content/works/` and confirm the build fails naming that file and field.

The dev server needs a real socket, so it will not start inside the command
sandbox — run it with the sandbox disabled.

## Architecture

**TypeScript runs natively.** Node 24 strips types on import, so there is no
bundler, no transpile step and no build output for the TS; `tsc` is only a
checker. `erasableSyntaxOnly` rejects `enum`, `namespace` and parameter
properties, which stripping cannot handle. `.ts` data files work because
`eleventy.config.ts` registers a `ts` data extension with `read: false`.

**Content is validated at the type boundary.** `types/content.ts` is the single
source of truth for a work; `parseWork` runs inside the `works` collection and
throws, which fails the build. This is deliberately the project's only test.

**Two independent path-prefix mechanisms**, and both must agree: templates go
through Eleventy's `url` filter, while image URLs are prefixed by
`src/_lib/path-prefix.ts` because `@11ty/eleventy-img` writes markup directly and
never sees the filter. A hardcoded absolute path in a template works locally and
404s on a project page.

**CSS cascade layers**: `reset, base, components, layout, theme`, declared in
`base.css`, which must load first. WebC component styles are wrapped into the
`components` layer in `base.webc` — unlayered styles beat every layer, so without
that wrapper components would override `theme.css`.

**Sections are content files** in `src/content/sections/` — painting, sculpture,
video — not pagination; see the permalink constraint below. The menu is derived:
`src/_data/navigation.ts` holds only what cannot be computed, while sections and
their counts come from the works, so it cannot drift.

**Work metadata is mostly optional.** The source material arrived with no titles,
years, media, dimensions or alt text, so only `title`, `section`, `image` and
`alt` are required. Never assume `year`/`medium`/`dimensions` exist — build the
metadata line with `formatWorkMeta`, which drops absent parts. `/todo/` is
generated from the works and tracks what is still owed; alt text derived from a
filename passes the build but describes nothing.

**Assets come from `design-spec/`**, which is gitignored. `scripts/import-design-spec.ts`
and `scripts/build-favicon.ts` are committed with their output — change the
output by changing the script and re-running, never by hand-editing, or the two
drift apart. Video is transcoded manually with system ffmpeg; commands are in
`README.md`.

**Almost no JavaScript.** The off-canvas menu and the full-size lightbox are
`popover`, so the browser owns the top layer, light-dismiss, Escape and focus. The
cover slideshow is a scroll-snap track whose arrows are anchors pointing at the
neighbouring slide's `id`, wrapping at both ends. The site is fully navigable with
JS disabled.

There is exactly one script beyond the declarative `speculationrules` block:
`assets/js/reduced-motion.js`, which pauses autoplaying video for
`prefers-reduced-motion`. CSS cannot stop autoplay, and the artist chose autoplay,
so the gate needs script. Autoplay itself is the plain HTML attribute, so JS-off
still plays. Do not add a second script without a reason as specific as this one. Progressive enhancement throughout — `@view-transition`,
scroll-driven animation and container queries all degrade to working HTML.

**Images** go through `@11ty/eleventy-img` via the `picture` shortcode:
photographs emit AVIF + WebP with a JPEG fallback, SVG sources emit the vector
with raster behind it. Every `<img>` carries `srcset`, `sizes` and intrinsic
dimensions. ICC profiles are preserved and JPEG uses 4:4:4 chroma — colour
fidelity matters more than bytes for a photograph of a painting. Keep `sizes` in
step with the layout breakpoints, or the browser picks resolutions for a layout
that no longer exists.

CSS masonry and the carousel pseudo-elements are deliberately unused.

## WebC constraints

These are not preferences; each one caused a real bug.

- **Components receive no page or global data — only props.** `this.site`,
  `this.collections` etc. are undefined inside a component. Pass what a component
  needs from `base.webc` as `:@prop="value"`. Filters *are* available, so
  `this.url()` works in components.
- **Page data needs the `this.` prefix.** Bare `site` is undefined; `this.site` is
  not.
- **Shortcodes and filters shadow page data of the same name**, silently rendering
  the function's own source into the page. The image shortcode is `picture`, not
  `image`, and there are no `year` or `dimensions` filters, because every work has
  those fields.
- **`setDynamicPermalinks(false)` must stay off.** Rendering a permalink through
  WebC invokes its CSS bundler before `page` exists and crashes the build.
  Consequence: permalinks are functions in `*.11tydata.ts`, and **a paginated
  template's permalink function is never evaluated** (`Template.js` uses the raw
  value; only `renderPermalink`, reached only when dynamic permalinks are on,
  resolves functions). That is why series are files.
- **`<link rel="stylesheet">` needs `webc:keep`**, or WebC inlines it into the
  component bundle and collapses the layer ordering.
- **`webc:setup` bindings are not visible to the surrounding markup.** Compute in
  `eleventyComputed` instead, which does receive `collections`.
- **Markdown cannot host custom elements.** markdown-it treats an unknown element
  as inline and wraps it in a `<p>`, so the component's `<section>` ends up inside
  a paragraph. Use a `.webc` page.
- **An ambient `.d.ts` must have no top-level `import`/`export`**, or it becomes a
  module and its `declare module` blocks silently stop applying
  (`types/vendor.d.ts`).

## Conventions

- **No comments in code** — not in TS, CSS, WebC or SVG. Names and structure carry
  the meaning; rationale goes in this file and in commit messages. SVG `<title>`
  and `<desc>` stay, being the accessible name and description.
- **Be consistent and do not duplicate.** Shared classes live in `base.css`
  (`shell`, `prose`, `list-plain`, `link-plain`, `button-plain`, `control`,
  `media-cover`, `media-fit`); token defaults live there too, so call sites use
  `var(--ink-muted)` with no fallback. Two places solving one problem differently
  is a defect.
- **Mobile-first, one breakpoint scale**: 40/48/64/80rem, in rem, `min-width`
  only.
- **Container queries: the container is always a wrapper, never the element being
  styled.** A container query matches descendants only, so a rule targeting its
  own container silently never applies. This produced a one-column grid that
  looked plausible for several commits.
- **Accessibility is a correctness condition**: one `h1` per page, ≥24px targets,
  muted text as a colour token never stacked `opacity` (it compounds and fails
  contrast), `aria-current` on the active nav link, everything gated on
  `prefers-reduced-motion`.
- **Every authored graphic is SVG or CSS** — no PNG/JPEG, no icon font.
  Photographs of physical work are the sole exception, having no vector form.
- **Fonts are self-hosted woff2.** No CDN link: the build asserts no third-party
  origin appears in the output.
- **The visual design belongs to the artist.** Do not invent aesthetics; when a
  visual decision is needed, build the hook and hand the decision back.
- **Commit each finished task**, without being asked and without batching.

## Verifying

There is no browser in this environment, so structure, generated markup, links
and CSS text are verifiable but **appearance is not**. Say so rather than implying
a visual check happened. Useful passes over `_site/`: one `h1` and full landmarks
per page, every `<img>` with non-empty alt, no `href` pointing at a missing file,
and no `https?://` origin outside `w3.org`.
