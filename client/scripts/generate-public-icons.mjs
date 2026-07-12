import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Resvg } from '@resvg/resvg-js';
import toIco from 'to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

const renderPng = (svg, outputPath, width, { withText = false } = {}) => {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: width,
    },
    ...(withText
      ? {
          font: {
            loadSystemFonts: true,
            defaultFontFamily: 'sans-serif',
          },
        }
      : {}),
  });
  fs.writeFileSync(outputPath, resvg.render().asPng());
};

const logoSvg = fs.readFileSync(path.join(publicDir, 'logo.svg'), 'utf8');
const logoInnerMatch = logoSvg.match(/<\/clipPath>([\s\S]*)<\/svg>/);
const defsMatch = logoSvg.match(/<defs>[\s\S]*?<\/defs>/);
if (!logoInnerMatch) {
  throw new Error('Failed to parse logo.svg');
}

const defs = defsMatch?.[0] ?? '';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const LOGO_VIEWBOX_WIDTH = 1909;
const LOGO_CONTENT_HEIGHT = 372;
const OG_HORIZONTAL_PADDING = Math.round(LOGO_VIEWBOX_WIDTH * 0.06);
const LOGO_SCALE = (LOGO_VIEWBOX_WIDTH - OG_HORIZONTAL_PADDING * 2) / LOGO_VIEWBOX_WIDTH;
const SCALED_LOGO_HEIGHT = LOGO_CONTENT_HEIGHT * LOGO_SCALE;
const OG_VIEWBOX_HEIGHT = Math.round((LOGO_VIEWBOX_WIDTH * OG_HEIGHT) / OG_WIDTH);
const VERTICAL_PADDING = (OG_VIEWBOX_HEIGHT - SCALED_LOGO_HEIGHT) / 2;
const OG_TAGLINE = 'Track every set. See your progress.';
const OG_BADGE_TEXT = 'Open app';
const BRAND_BLUE = '#3b82f6';
const TEXT_DARK = '#374151';
const TAGLINE_FONT_SIZE = 42;
const BADGE_FONT_SIZE = 34;
const BADGE_PAD_X = 36;
const BADGE_PAD_Y = 22;
const BADGE_WIDTH = 280;
const BADGE_HEIGHT = BADGE_FONT_SIZE + BADGE_PAD_Y * 2;
const BADGE_X = LOGO_VIEWBOX_WIDTH - BADGE_WIDTH - OG_HORIZONTAL_PADDING;
const BADGE_Y = OG_VIEWBOX_HEIGHT - BADGE_HEIGHT - 56;
const TAGLINE_Y = VERTICAL_PADDING + SCALED_LOGO_HEIGHT + 58;

const logoOgSvg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${LOGO_VIEWBOX_WIDTH} ${OG_VIEWBOX_HEIGHT}">
  ${defs}
  <rect width="${LOGO_VIEWBOX_WIDTH}" height="${OG_VIEWBOX_HEIGHT}" fill="#ffffff" />
  <clipPath id="cl_og">
    <rect x="0" y="0" width="${LOGO_VIEWBOX_WIDTH}" height="${LOGO_CONTENT_HEIGHT}" />
  </clipPath>
  <g transform="translate(${OG_HORIZONTAL_PADDING}, ${VERTICAL_PADDING}) scale(${LOGO_SCALE})" clip-path="url(#cl_og)">
    ${logoInnerMatch[1]}
  </g>
  <text
    x="${LOGO_VIEWBOX_WIDTH / 2}"
    y="${TAGLINE_Y}"
    text-anchor="middle"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="${TAGLINE_FONT_SIZE}"
    font-weight="600"
    fill="${TEXT_DARK}"
  >${OG_TAGLINE}</text>
  <rect
    x="${BADGE_X}"
    y="${BADGE_Y}"
    width="${BADGE_WIDTH}"
    height="${BADGE_HEIGHT}"
    rx="${BADGE_HEIGHT / 2}"
    fill="${BRAND_BLUE}"
  />
  <text
    x="${BADGE_X + BADGE_WIDTH / 2}"
    y="${BADGE_Y + BADGE_HEIGHT / 2 + BADGE_FONT_SIZE * 0.35}"
    text-anchor="middle"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="${BADGE_FONT_SIZE}"
    font-weight="600"
    fill="#ffffff"
  >${OG_BADGE_TEXT}</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'logo-og.svg'), logoOgSvg);

const faviconSvg = fs.readFileSync(path.join(publicDir, 'favicon.svg'), 'utf8');

const pngTargets = [
  { svg: faviconSvg, name: 'favicon-16x16.png', width: 16 },
  { svg: faviconSvg, name: 'favicon-32x32.png', width: 32 },
  { svg: faviconSvg, name: 'favicon-48x48.png', width: 48 },
  { svg: faviconSvg, name: 'favicon-180x180.png', width: 180 },
  { svg: faviconSvg, name: 'favicon-192x192.png', width: 192 },
  { svg: faviconSvg, name: 'favicon-512x512.png', width: 512 },
  { svg: logoOgSvg, name: 'logo-og.png', width: OG_WIDTH },
];

for (const target of pngTargets) {
  renderPng(target.svg, path.join(publicDir, target.name), target.width, {
    withText: target.name === 'logo-og.png',
  });
}

const icoSizes = ['favicon-16x16.png', 'favicon-32x32.png', 'favicon-48x48.png'];
const icoBuffers = icoSizes.map((name) => fs.readFileSync(path.join(publicDir, name)));
const ico = await toIco(icoBuffers);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);

console.log(`Generated ${pngTargets.length + 2} public icon files in ${publicDir}`);
