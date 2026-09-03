import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#142c1d"/>
      <stop offset="60%" stop-color="#09180f"/>
      <stop offset="100%" stop-color="#040b07"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe28a"/>
      <stop offset="50%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#996515"/>
    </linearGradient>
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e74c3c"/>
      <stop offset="100%" stop-color="#962d22"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="100" fill="url(#bgGrad)"/>
  <rect width="496" height="496" x="8" y="8" rx="92" fill="none" stroke="url(#goldGrad)" stroke-width="4" opacity="0.6"/>

  <!-- Outer Wheel Rim -->
  <circle cx="256" cy="256" r="185" fill="#1b1b1b" stroke="url(#goldGrad)" stroke-width="12" filter="url(#glow)"/>
  
  <!-- Number Track Segments Ring -->
  <circle cx="256" cy="256" r="160" fill="none" stroke="#2a0808" stroke-width="26" stroke-dasharray="26 26"/>
  <circle cx="256" cy="256" r="160" fill="none" stroke="#0d0d0d" stroke-width="26" stroke-dasharray="26 26" stroke-dashoffset="26"/>
  
  <!-- Inner Ring -->
  <circle cx="256" cy="256" r="135" fill="#102517" stroke="url(#goldGrad)" stroke-width="6"/>

  <!-- Wheel Center Cone & Spokes -->
  <circle cx="256" cy="256" r="85" fill="#1e1e1e" stroke="url(#goldGrad)" stroke-width="4"/>
  <line x1="256" y1="171" x2="256" y2="341" stroke="url(#goldGrad)" stroke-width="4"/>
  <line x1="171" y1="256" x2="341" y2="256" stroke="url(#goldGrad)" stroke-width="4"/>
  <line x1="196" y1="196" x2="316" y2="316" stroke="url(#goldGrad)" stroke-width="4"/>
  <line x1="196" y1="316" x2="316" y2="196" stroke="url(#goldGrad)" stroke-width="4"/>

  <!-- Center Turret Brass -->
  <circle cx="256" cy="256" r="45" fill="url(#goldGrad)" stroke="#fff" stroke-width="2"/>
  <circle cx="256" cy="256" r="22" fill="#5c3d0b"/>
  <circle cx="256" cy="256" r="12" fill="url(#goldGrad)"/>

  <!-- Ivory Ball -->
  <circle cx="345" cy="205" r="16" fill="#ffffff" filter="url(#glow)"/>
  <circle cx="342" cy="202" r="5" fill="#ffffff"/>

  <!-- Vegas Lettering / Crown Banner -->
  <path d="M120 420 L392 420" stroke="url(#goldGrad)" stroke-width="3"/>
  <text x="256" y="455" font-family="'Cinzel', 'Playfair Display', serif" font-weight="900" font-size="34" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="8">VEGAS</text>
  <text x="256" y="482" font-family="sans-serif" font-weight="700" font-size="16" fill="#ffffff" text-anchor="middle" letter-spacing="6" opacity="0.85">ROULETTE</text>
</svg>
`;

// Maskable icon with 15% safe padding
const svgMaskableIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#142c1d"/>
      <stop offset="60%" stop-color="#09180f"/>
      <stop offset="100%" stop-color="#040b07"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe28a"/>
      <stop offset="50%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#996515"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Full Bleed Background for Maskable -->
  <rect width="512" height="512" fill="url(#bgGrad)"/>

  <!-- Content scaled to 78% for safe zone -->
  <g transform="translate(56, 56) scale(0.78)">
    <circle cx="256" cy="256" r="185" fill="#1b1b1b" stroke="url(#goldGrad)" stroke-width="14" filter="url(#glow)"/>
    <circle cx="256" cy="256" r="160" fill="none" stroke="#e74c3c" stroke-width="26" stroke-dasharray="26 26"/>
    <circle cx="256" cy="256" r="160" fill="none" stroke="#111111" stroke-width="26" stroke-dasharray="26 26" stroke-dashoffset="26"/>
    <circle cx="256" cy="256" r="135" fill="#102517" stroke="url(#goldGrad)" stroke-width="6"/>
    <circle cx="256" cy="256" r="85" fill="#1e1e1e" stroke="url(#goldGrad)" stroke-width="4"/>
    <line x1="256" y1="171" x2="256" y2="341" stroke="url(#goldGrad)" stroke-width="4"/>
    <line x1="171" y1="256" x2="341" y2="256" stroke="url(#goldGrad)" stroke-width="4"/>
    <circle cx="256" cy="256" r="45" fill="url(#goldGrad)"/>
    <circle cx="256" cy="256" r="22" fill="#5c3d0b"/>
    <circle cx="340" cy="205" r="16" fill="#ffffff" filter="url(#glow)"/>
    <text x="256" y="445" font-family="serif" font-weight="900" font-size="40" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="6">VEGAS</text>
  </g>
</svg>
`;

async function generate() {
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write SVG
  fs.writeFileSync(path.join(rootDir, 'icon.svg'), svgIcon);
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);

  // Generate 512x512
  await sharp(Buffer.from(svgIcon))
    .resize(512, 512)
    .png()
    .toFile(path.join(rootDir, 'pwa-512x512.png'));
  await sharp(Buffer.from(svgIcon))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // Generate 192x192
  await sharp(Buffer.from(svgIcon))
    .resize(192, 192)
    .png()
    .toFile(path.join(rootDir, 'pwa-192x192.png'));
  await sharp(Buffer.from(svgIcon))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // Generate 180x180 apple touch icon
  await sharp(Buffer.from(svgIcon))
    .resize(180, 180)
    .png()
    .toFile(path.join(rootDir, 'apple-touch-icon.png'));
  await sharp(Buffer.from(svgIcon))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Generate Maskable 512x512
  await sharp(Buffer.from(svgMaskableIcon))
    .resize(512, 512)
    .png()
    .toFile(path.join(rootDir, 'pwa-maskable-512x512.png'));
  await sharp(Buffer.from(svgMaskableIcon))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Generate favicon
  await sharp(Buffer.from(svgIcon))
    .resize(64, 64)
    .png()
    .toFile(path.join(rootDir, 'favicon.png'));
  await sharp(Buffer.from(svgIcon))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('Successfully generated all PWA icons!');
}

generate().catch(console.error);
