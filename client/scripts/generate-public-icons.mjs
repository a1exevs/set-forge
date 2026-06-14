import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Resvg } from '@resvg/resvg-js';
import toIco from 'to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

const renderPng = (svg, outputPath, width) => {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: width,
    },
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

const logoOgSvg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="950" height="451" viewBox="0 0 1909 906">
  ${defs}
  <clipPath id="cl_og">
    <rect x="0" y="0" width="1909" height="372" />
  </clipPath>
  <g transform="translate(0, 267)" clip-path="url(#cl_og)">
    ${logoInnerMatch[1]}
  </g>
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
  { svg: logoOgSvg, name: 'logo-og.png', width: 950 },
];

for (const target of pngTargets) {
  renderPng(target.svg, path.join(publicDir, target.name), target.width);
}

const icoSizes = ['favicon-16x16.png', 'favicon-32x32.png', 'favicon-48x48.png'];
const icoBuffers = icoSizes.map((name) => fs.readFileSync(path.join(publicDir, name)));
const ico = await toIco(icoBuffers);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);

console.log(`Generated ${pngTargets.length + 2} public icon files in ${publicDir}`);
