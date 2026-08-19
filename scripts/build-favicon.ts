import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import sharp from 'sharp'

const require = createRequire(import.meta.url)
const potrace = require('potrace') as {
  trace: (
    input: Buffer,
    options: Record<string, unknown>,
    callback: (error: Error | null, svg: string) => void,
  ) => void
}

const SOURCE = 'design-spec/favicon/Favikon.png'
const SVG_OUT = 'src/assets/favicon.svg'
const TOUCH_OUT = 'src/assets/apple-touch-icon.png'
const INK = '#212e21'
const PAPER = '#f4f3e8'
const TOUCH_SIZE = 180
const TRACE_SIZE = 1400

const trimmed = await sharp(SOURCE)
  .flatten({ background: '#ffffff' })
  .greyscale()
  .trim({ threshold: 20 })
  .resize({ width: TRACE_SIZE, height: TRACE_SIZE, fit: 'inside' })
  .extend({ top: 40, bottom: 40, left: 40, right: 40, background: '#ffffff' })
  .png()
  .toBuffer()

const traced = await new Promise<string>((resolve, reject) => {
  potrace.trace(
    trimmed,
    { threshold: 160, turdSize: 40, optCurve: true, optTolerance: 0.4 },
    (error, svg) => (error ? reject(error) : resolve(svg)),
  )
})

const viewBox = traced.match(/viewBox="([^"]+)"/)?.[1]
const path = traced.match(/ d="([^"]+)"/)?.[1]
if (!viewBox || !path) throw new Error('potrace produced no path')

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="Miriam Strauss">
<style>:root{color:${INK}}@media(prefers-color-scheme:dark){:root{color:${PAPER}}}</style>
<path fill="currentColor" fill-rule="evenodd" d="${path}"/>
</svg>
`
await fs.writeFile(SVG_OUT, favicon)

await sharp(Buffer.from(favicon))
  .resize(TOUCH_SIZE, TOUCH_SIZE, { fit: 'contain', background: PAPER })
  .flatten({ background: PAPER })
  .png()
  .toFile(TOUCH_OUT)

console.log(`${SVG_OUT} — ${(favicon.length / 1024).toFixed(1)} KB, viewBox ${viewBox}`)
console.log(`${TOUCH_OUT} — ${TOUCH_SIZE}x${TOUCH_SIZE}`)
