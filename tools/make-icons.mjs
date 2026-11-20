// Generates every מעשרותי icon from tools/icon-svg.mjs.
// Run: node tools/make-icons.mjs   (uses sharp; outputs are committed, CI does not need it)
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { iconSvg, COLORS } from './icon-svg.mjs';

import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
// sharp when installed, otherwise rsvg-convert.
let sharp = null;
try { sharp = createRequire(process.env.SHARP_FROM || '/opt/npm-tools/node_modules/')('sharp'); } catch (e) { sharp = null; }
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RES = join(ROOT, 'android-res');

async function png(svg, file) {
  mkdirSync(dirname(file), { recursive: true });
  if (sharp) { await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(file); return; }
  const tmp = join(tmpdir(), 'icon-' + Date.now() + Math.random() + '.svg');
  writeFileSync(tmp, svg);
  execFileSync('rsvg-convert', ['-o', file, tmp]);
}
function text(file, content) { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, content); }

// Adaptive-icon foreground: the glyph must stay inside the 66dp safe circle of the 108dp canvas.
const DENS = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [name, m] of Object.entries(DENS)) {
  const legacy = Math.round(48 * m), fg = Math.round(108 * m);
  await png(iconSvg({ size: legacy, shape: 'square', scale: 1 }), join(RES, 'mipmap-' + name, 'ic_launcher.png'));
  await png(iconSvg({ size: legacy, shape: 'circle', scale: 0.92 }), join(RES, 'mipmap-' + name, 'ic_launcher_round.png'));
  await png(iconSvg({ size: fg, shape: 'none', scale: 0.8 }), join(RES, 'mipmap-' + name, 'ic_launcher_foreground.png'));
}
const adaptive = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`;
text(join(RES, 'mipmap-anydpi-v26', 'ic_launcher.xml'), adaptive);
text(join(RES, 'mipmap-anydpi-v26', 'ic_launcher_round.xml'), adaptive);
text(join(RES, 'values', 'ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${COLORS.bg}</color>
</resources>
`);
text(join(RES, 'drawable', 'splash.xml'), `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item>
        <color android:color="${COLORS.bg}" />
    </item>
    <item
        android:width="180dp"
        android:height="180dp"
        android:gravity="center"
        android:drawable="@mipmap/ic_launcher_foreground" />
</layer-list>
`);
await png(iconSvg({ size: 192, shape: 'square' }), join(ROOT, 'www', 'icon.png'));
await png(iconSvg({ size: 512, shape: 'square' }), join(ROOT, 'www', 'icon-512.png'));
await png(iconSvg({ size: 180, shape: 'full', scale: 1.05 }), join(ROOT, 'www', 'icon-180.png'));
await png(iconSvg({ size: 512, shape: 'full', scale: 0.85 }), join(ROOT, 'www', 'icon-maskable-512.png'));
// Notification icon: white coin with the yud cut out (Android draws it in one colour).
text(join(RES, 'drawable', 'ic_stat_maasroti.xml'), `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="120" android:viewportHeight="120">
    <path android:fillColor="#FFFFFFFF" android:fillType="evenOdd" android:pathData="M60,18a42,42 0 1,0 0.01,0Z M50,44h17a7,7 0 0,1 7,7v3c0,9 -4,15 -12,19l-4,-6c4,-2 6,-5 6,-8H50a7,7 0 0,1 0,-15Z"/>
</vector>
`);
await png(iconSvg({ size: 1024, shape: 'square' }), join(ROOT, 'assets', 'icon-1024.png'));
writeFileSync(join(ROOT, 'www', 'logo.svg'), iconSvg({ size: 256, shape: 'square' }));
console.log('icons done');
