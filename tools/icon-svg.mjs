// מעשרותי icon artwork: a gold coin with the letter yud (י = 10, the tenth) on deep blue.
// Drawn in a 120x120 box. Helpers build every size/shape the app needs.
export const COLORS = { bg: '#173A7A', coin: '#E3B341', ring: '#C4921F', mark: '#173A7A' };

// The coin spans 24..96 (centre 60,60).
export function glyph() {
  return `<circle cx="60" cy="60" r="36" fill="${COLORS.coin}"/>` +
    `<circle cx="60" cy="60" r="29" fill="none" stroke="${COLORS.ring}" stroke-width="3"/>` +
    `<path d="M50 44h17a7 7 0 0 1 7 7v3c0 9-4 15-12 19l-4-6c4-2 6-5 6-8H50a7 7 0 0 1 0-15Z" fill="${COLORS.mark}"/>`;
}

// shape: 'square' (rounded square), 'full' (square edge to edge: iPhone / maskable), 'circle', 'none' (transparent)
export function iconSvg({ size = 1024, shape = 'square', scale = 1 } = {}) {
  let bg = '';
  if (shape === 'square') bg = `<rect width="120" height="120" rx="30" fill="${COLORS.bg}"/>`;
  else if (shape === 'full') bg = `<rect width="120" height="120" fill="${COLORS.bg}"/>`;
  else if (shape === 'circle') bg = `<circle cx="60" cy="60" r="60" fill="${COLORS.bg}"/>`;
  const g = `<g transform="translate(60 60) scale(${scale}) translate(-60 -60)">${glyph()}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 120 120">${bg}${g}</svg>`;
}
