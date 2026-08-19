import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import type { Section } from '../types/content.ts'

const SPEC_ROOT = 'design-spec/Work'
const ASSET_ROOT = 'src/assets/works'
const CONTENT_ROOT = 'src/content/works'
const LONGEST_EDGE = 2400

const SECTION_BY_FOLDER: Record<string, Section> = {
  Painting: 'painting',
  Sculpture: 'sculpture',
  Video: 'video',
}

const TITLE_OVERRIDES: Record<string, string> = {
  ClimingUpThrees: 'Climbing Up Trees',
  RevolutionInBernMussVerschobenWerden: 'Revolution in Bern muss verschoben werden',
}

const CAMERA_NOISE = /^(tumblr|img|dsc|mvi|mg|_mg|screenshot|photo|foto|scan|untitled|unbenannt)/i

const RASTER = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff'])
const IGNORED_NAMES = new Set(['.DS_Store', '.localized'])

interface ImportedImage {
  readonly src: string
  readonly alt: string
  readonly group?: string
}

function titleFromName(name: string): string {
  if (TITLE_OVERRIDES[name]) return TITLE_OVERRIDES[name]
  return name
    .replace(/^\d+[.\s_-]*/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-zäöüß])([A-ZÄÖÜ])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function altFromFilename(name: string, workTitle: string): string {
  const base = path.basename(name, path.extname(name))
  const cleaned = titleFromName(base)
    .replace(/\bKopie\b/gi, '')
    .replace(/\bIMG\b/gi, '')
    .replace(/\bMG\b/gi, '')
    .replace(/[_\d]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (cleaned.length < 3 || CAMERA_NOISE.test(base)) return workTitle
  return cleaned
}

async function listEntries(dir: string): Promise<{ files: string[]; dirs: string[] }> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []
  const dirs: string[] = []
  for (const entry of entries) {
    if (entry.name.startsWith('.') || IGNORED_NAMES.has(entry.name)) continue
    if (entry.isDirectory()) dirs.push(entry.name)
    else if (RASTER.has(path.extname(entry.name).toLowerCase())) files.push(entry.name)
  }
  return { files: files.sort(), dirs: dirs.sort() }
}

async function convert(source: string, destination: string): Promise<void> {
  await fs.mkdir(path.dirname(destination), { recursive: true })
  await sharp(source, { failOn: 'error' })
    .rotate()
    .resize({ width: LONGEST_EDGE, height: LONGEST_EDGE, fit: 'inside', withoutEnlargement: true })
    .withMetadata()
    .jpeg({ quality: 88, progressive: true, chromaSubsampling: '4:4:4' })
    .toFile(destination)
}

async function collectImages(
  workDir: string,
  section: Section,
  workSlug: string,
  workTitle: string,
  group: string | undefined,
  out: ImportedImage[],
): Promise<void> {
  const { files, dirs } = await listEntries(workDir)
  const leadFirst = [...files].sort(
    (a, b) =>
      Number(slugify(path.basename(b, path.extname(b))).includes(workSlug)) -
      Number(slugify(path.basename(a, path.extname(a))).includes(workSlug)),
  )
  for (const file of leadFirst) {
    const slug = slugify(path.basename(file, path.extname(file))) || 'image'
    const name = group ? `${slugify(group)}-${slug}.jpg` : `${slug}.jpg`
    const destination = path.join(ASSET_ROOT, section, workSlug, name)
    await convert(path.join(workDir, file), destination)
    out.push({
      src: destination,
      alt: altFromFilename(file, workTitle),
      ...(group === undefined ? {} : { group }),
    })
  }
  for (const dir of dirs) {
    await collectImages(path.join(workDir, dir), section, workSlug, workTitle, titleFromName(dir), out)
  }
}

function yamlQuote(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function workMarkdown(
  title: string,
  section: Section,
  lead: ImportedImage,
  rest: readonly ImportedImage[],
): string {
  const lines = [
    '---',
    `title: ${yamlQuote(title)}`,
    `section: ${section}`,
    `image: ${lead.src}`,
    `alt: ${yamlQuote(lead.alt)}`,
  ]
  if (rest.length > 0) {
    lines.push('images:')
    for (const image of rest) {
      lines.push(`  - src: ${image.src}`)
      lines.push(`    alt: ${yamlQuote(image.alt)}`)
      if (image.group) lines.push(`    group: ${yamlQuote(image.group)}`)
    }
  }
  lines.push('---', '')
  return lines.join('\n')
}

async function importSection(folder: string, section: Section): Promise<number> {
  const sectionDir = path.join(SPEC_ROOT, folder)
  const { files, dirs } = await listEntries(sectionDir)
  let count = 0

  for (const file of files) {
    const title = titleFromName(path.basename(file, path.extname(file)))
    const workSlug = slugify(title)
    const destination = path.join(ASSET_ROOT, section, `${workSlug}.jpg`)
    await convert(path.join(sectionDir, file), destination)
    const lead: ImportedImage = { src: destination, alt: altFromFilename(file, title) }
    await fs.writeFile(
      path.join(CONTENT_ROOT, `${workSlug}.md`),
      workMarkdown(title, section, lead, []),
    )
    console.log(`  ${section}/${workSlug} — 1 image`)
    count += 1
  }

  for (const dir of dirs) {
    const title = titleFromName(dir)
    const workSlug = slugify(title)
    const images: ImportedImage[] = []
    await collectImages(path.join(sectionDir, dir), section, workSlug, title, undefined, images)
    if (images.length === 0) {
      console.log(`  ${section}/${workSlug} — SKIPPED, no images`)
      continue
    }
    const [lead, ...rest] = images
    await fs.writeFile(
      path.join(CONTENT_ROOT, `${workSlug}.md`),
      workMarkdown(title, section, lead!, rest),
    )
    console.log(`  ${section}/${workSlug} — ${images.length} image(s)`)
    count += 1
  }

  return count
}

const total: number[] = []
for (const [folder, section] of Object.entries(SECTION_BY_FOLDER)) {
  console.log(`${folder} →`)
  total.push(await importSection(folder, section))
}
console.log(`\n${total.reduce((a, b) => a + b, 0)} works imported`)
