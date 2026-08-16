# Bundled typefaces

All seven faces are self-hosted so the site makes no third-party font request.
Every one is under the SIL Open Font License, which permits bundling and
redistribution provided the licence travels with the files — hence this note.

Only the **Latin subset** of each Google-hosted family was downloaded. If the site
ever needs Greek, Cyrillic, or extended Latin, re-download the fuller subset.

| File | Family | Source | Licence |
|---|---|---|---|
| `istok-web-400.woff2` | Istok Web | Google Fonts | OFL |
| `fraunces-variable.woff2` | Fraunces | Google Fonts | OFL |
| `redaction-regular.woff2` | Redaction (Bye Bye Binary edition) | [mgodefroy/BBB-Redaction-Regular](https://github.com/mgodefroy/BBB-Redaction-Regular) | OFL |
| `bricolage-variable.woff2` | Bricolage Grotesque | Google Fonts | OFL |
| `literata-variable.woff2` | Literata | Google Fonts | OFL |
| `bodoni-moda-variable.woff2` | Bodoni Moda | Google Fonts | OFL |
| `source-serif-4-variable.woff2` | Source Serif 4 | Google Fonts | OFL |

The first two are the site's faces: **Istok Web** for body text, **Fraunces** for
headings. The rest are used only by `/specimen/` and can go once the choice is
settled.

Istok Web is not a variable font, so only its regular weight is bundled; add the
700 file if bold is ever needed.

Fraunces is bundled with all four axes — `opsz`, `wght`, `SOFT` and `WONK`. The
site drives `SOFT` and `WONK` through `--font-display-settings` in
`../css/theme.css`, so the axis file is larger than a weight-only build would be
and must stay that way for those settings to do anything.

## Redaction, specifically

Drawn by Jeremy Mickel (MCKL) and Forest Young; commissioned by Titus Kaphar and
Reginald Dwayne Betts for *Redaction*, their project on mass incarceration and
the bail system. The family exists in seven grades of progressive degradation —
the degradation is the argument, not an effect.

The bundled file is the Bye Bye Binary edition (Marie Godefroy), which extends
Redaction Regular with 110 non-binary glyphs.

Copyright (c) 2023 Titus Kaphar and Reginald Dwayne Betts, Marie Godefroy, with
Bye Bye Binary's guide.
