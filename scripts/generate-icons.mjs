/**
 * Generates PNG app icons from public/icon.svg using sharp.
 * Run via: node scripts/generate-icons.mjs
 */
import sharp from 'sharp'
import { readFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root  = resolve(__dir, '..')
const src   = resolve(root, 'public', 'icon.svg')
const pub   = resolve(root, 'public')

if (!existsSync(pub)) mkdirSync(pub, { recursive: true })

const svgBuf = readFileSync(src)

const icons = [
  { size: 192,  file: 'icon-192.png' },
  { size: 512,  file: 'icon-512.png' },
  { size: 180,  file: 'apple-touch-icon.png' },  // iOS home screen
  { size: 32,   file: 'favicon-32.png' },
]

for (const { size, file } of icons) {
  await sharp(svgBuf)
    .resize(size, size)
    .png()
    .toFile(resolve(pub, file))
  console.log(`  ✓ ${file} (${size}×${size})`)
}

console.log('Icons generated.')
