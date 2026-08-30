# Bundled typefaces

Both faces are self-hosted so the site makes no third-party font request. Each is
under the SIL Open Font License, which permits bundling and redistribution
provided the licence travels with the files — hence this note.

Only the **Latin subset** of each Google-hosted family was downloaded. If the site
ever needs Greek, Cyrillic, or extended Latin, re-download the fuller subset.

| File | Family | Source | Licence |
|---|---|---|---|
| `istok-web-400.woff2` | Istok Web | Google Fonts | OFL |
| `fraunces-variable.woff2` | Fraunces | Google Fonts | OFL |

**Istok Web** sets body text and **Fraunces** sets headings.

Istok Web is not a variable font, so only its regular weight is bundled; add the
700 file if bold is ever needed.

Fraunces is bundled with all four axes — `opsz`, `wght`, `SOFT` and `WONK`. The
site drives `SOFT` and `WONK` through `--font-display-settings` in
`../css/theme.css`, so the axis file is larger than a weight-only build would be
and must stay that way for those settings to do anything.

