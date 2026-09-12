/**
 * Generates every Rehan Success brand bitmap from one vector definition:
 *   web    → public/favicon.svg, icon-192.png, icon-512.png, apple-touch-icon.png, og.png
 *   mobile → mobile/assets/icon.png, adaptive-icon.png, splash.png, notification-icon.png, logo.png, logo-dark.png
 *
 * Usage: node scripts/generate-brand-assets.mjs   (requires `sharp`, bundled with Next.js)
 * To swap in a final logo, edit MARK() below and re-run.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pub = path.join(root, 'public')
const mob = path.join(root, 'mobile', 'assets')
fs.mkdirSync(pub, { recursive: true })
fs.mkdirSync(mob, { recursive: true })

const defs = `
  <defs>
    <linearGradient id="tile" x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
      <stop stop-color="#14B8A6"/><stop offset="0.55" stop-color="#0F766E"/><stop offset="1" stop-color="#0B3F3B"/>
    </linearGradient>
    <linearGradient id="gold" x1="30" y1="8" x2="40" y2="20" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F1D786"/><stop offset="1" stop-color="#C9A13A"/>
    </linearGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#0B3F3B"/><stop offset="0.6" stop-color="#0B1020"/><stop offset="1" stop-color="#070B16"/>
    </linearGradient>
  </defs>`

/** Glyph (bars + apex) in the 48×48 space. `mono` = single colour silhouette. */
const GLYPH = (mono) => `
  <rect x="10.5" y="27" width="6.5" height="11" rx="2.2" fill="${mono || '#fff'}" fill-opacity="${mono ? 1 : 0.62}"/>
  <rect x="20.75" y="20.5" width="6.5" height="17.5" rx="2.2" fill="${mono || '#fff'}" fill-opacity="${mono ? 1 : 0.82}"/>
  <rect x="31" y="15" width="6.5" height="23" rx="2.2" fill="${mono || '#fff'}"/>
  <path d="M34.25 6.5 L39.6 12.4 L28.9 12.4 Z" fill="${mono || 'url(#gold)'}"/>`

const MARK = () => `
  <rect x="1" y="1" width="46" height="46" rx="13" fill="url(#tile)"/>
  <rect x="1.5" y="1.5" width="45" height="45" rx="12.5" fill="none" stroke="#fff" stroke-opacity="0.14"/>
  ${GLYPH()}`

const svgs = {
  favicon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">${defs}${MARK()}</svg>`,
  // Full-bleed icon (OS applies its own mask on iOS / PWA maskable)
  appIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 48 48">${defs}
    <rect width="48" height="48" fill="url(#tile)"/>
    <g transform="translate(4.8 4.8) scale(0.8)">${GLYPH()}</g></svg>`,
  adaptive: `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 48 48">${defs}
    <g transform="translate(12 12) scale(0.5)">${GLYPH()}</g></svg>`,
  notification: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 48 48">
    <g transform="translate(-0.5 1)">${GLYPH('#ffffff')}</g></svg>`,
  splash: `<svg xmlns="http://www.w3.org/2000/svg" width="1284" height="2778" viewBox="0 0 1284 2778">${defs}
    <rect width="1284" height="2778" fill="#0B1020"/>
    <g transform="translate(482 1229) scale(6.667)">${MARK()}</g></svg>`,
  logo: (ink, accent) => `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="216" viewBox="0 0 360 72">${defs}
    <g transform="translate(8 12)">${MARK()}</g>
    <text x="70" y="46" font-family="Segoe UI, Arial, sans-serif" font-size="28" letter-spacing="-0.6">
      <tspan fill="${ink}" font-weight="800">Rehan</tspan><tspan dx="7" fill="${accent}" font-weight="600">Success</tspan>
    </text></svg>`,
  og: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${defs}
    <defs><radialGradient id="glow" cx="0.85" cy="0.1" r="0.7"><stop stop-color="#2DD4BF" stop-opacity="0.35"/><stop offset="1" stop-color="#2DD4BF" stop-opacity="0"/></radialGradient></defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect width="1200" height="630" fill="url(#glow)"/>
    <g transform="translate(90 96) scale(2.2)">${MARK()}</g>
    <text x="90" y="330" font-family="Segoe UI, Arial, sans-serif" font-size="92" font-weight="800" fill="#FFFFFF" letter-spacing="-2.5">Rehan <tspan fill="#5EEAD4" font-weight="700">Success</tspan></text>
    <text x="92" y="400" font-family="Segoe UI, Arial, sans-serif" font-size="34" fill="#CBD5E1">Disciplined trading. Lasting success.</text>
    <g font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="600">
      <rect x="90" y="470" width="220" height="56" rx="28" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.18"/>
      <text x="200" y="506" text-anchor="middle" fill="#E2E8F0">Live signals</text>
      <rect x="326" y="470" width="250" height="56" rx="28" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.18"/>
      <text x="451" y="506" text-anchor="middle" fill="#E2E8F0">ICT education</text>
      <rect x="592" y="470" width="250" height="56" rx="28" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.18"/>
      <text x="717" y="506" text-anchor="middle" fill="#E2E8F0">Market research</text>
    </g></svg>`,
}

async function png(svg, file, w, h = w) {
  const buf = await sharp(Buffer.from(svg), { density: 384 }).resize(w, h).png({ compressionLevel: 9 }).toBuffer()
  fs.writeFileSync(file, buf)
  console.log(`✓ ${path.relative(root, file)} (${w}×${h}, ${(buf.length / 1024).toFixed(1)} KB)`)
}

fs.writeFileSync(path.join(pub, 'favicon.svg'), svgs.favicon)
console.log('✓ public/favicon.svg')
await png(svgs.appIcon, path.join(pub, 'icon-192.png'), 192)
await png(svgs.appIcon, path.join(pub, 'icon-512.png'), 512)
await png(svgs.appIcon, path.join(pub, 'apple-touch-icon.png'), 180)
await png(svgs.og, path.join(pub, 'og.png'), 1200, 630)

await png(svgs.appIcon, path.join(mob, 'icon.png'), 1024)
await png(svgs.adaptive, path.join(mob, 'adaptive-icon.png'), 1024)
await png(svgs.notification, path.join(mob, 'notification-icon.png'), 96)
await png(svgs.splash, path.join(mob, 'splash.png'), 1284, 2778)
await png(svgs.logo('#0B1121', '#0F766E'), path.join(mob, 'logo.png'), 1080, 216)
await png(svgs.logo('#FFFFFF', '#5EEAD4'), path.join(mob, 'logo-dark.png'), 1080, 216)
console.log('\nRehan Success brand assets generated.')
