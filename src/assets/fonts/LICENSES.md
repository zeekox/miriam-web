# Bundled typefaces

All six faces are self-hosted so the site makes no third-party font request. Every
one is under the SIL Open Font License, which permits bundling and redistribution
provided the licence travels with the files — hence this note.

Only the **Latin subset** of each Google-hosted family was downloaded. If the site
ever needs Greek, Cyrillic, or extended Latin, re-download the fuller subset.

| File | Family | Source | Licence |
|---|---|---|---|
| `redaction-regular.woff2` | Redaction (Bye Bye Binary edition) | [mgodefroy/BBB-Redaction-Regular](https://github.com/mgodefroy/BBB-Redaction-Regular) | OFL |
| `fraunces-variable.woff2` | Fraunces | Google Fonts | OFL |
| `bricolage-variable.woff2` | Bricolage Grotesque | Google Fonts | OFL |
| `literata-variable.woff2` | Literata | Google Fonts | OFL |
| `bodoni-moda-variable.woff2` | Bodoni Moda | Google Fonts | OFL |
| `source-serif-4-variable.woff2` | Source Serif 4 | Google Fonts | OFL |
| `work-sans-variable.woff2` | Work Sans | Google Fonts | OFL |
| `roboto-variable.woff2` | Roboto | Google Fonts | OFL |
| `istok-web-400.woff2` | Istok Web | Google Fonts | OFL |

The last three are used by `/texts/`: Work Sans for the headings, Roboto and
Istok Web for the two specimen paragraphs. Istok Web is not variable, so only its
regular weight is bundled.

## Redaction, specifically

Drawn by Jeremy Mickel (MCKL) and Forest Young; commissioned by Titus Kaphar and
Reginald Dwayne Betts for *Redaction*, their project on mass incarceration and
the bail system. The family exists in seven grades of progressive degradation —
the degradation is the argument, not an effect.

The bundled file is the Bye Bye Binary edition (Marie Godefroy), which extends
Redaction Regular with 110 non-binary glyphs.

Copyright (c) 2023 Titus Kaphar and Reginald Dwayne Betts, Marie Godefroy, with
Bye Bye Binary's guide.

## After you choose

Delete the four files belonging to the two pairings you did not pick, their
`@font-face` blocks in `../css/fonts.css`, and their rows above.
