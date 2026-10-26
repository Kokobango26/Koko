// Bundle the sites (GSAP + ScrollTrigger + Lenis + Three.js) into classic scripts,
// so they also open straight from the file system – no dev server required.
import { build, context } from 'esbuild';

const common = { bundle: true, minify: true, format: 'iife', target: ['es2019'], legalComments: 'none', logLevel: 'info' };
const targets = [
  { entryPoints: ['src/main.js'], outfile: 'assets/js/app.js' },
  { entryPoints: ['src/v2/main.js'], outfile: 'v2/app.js' },
];

if (process.argv.includes('--watch')) {
  for (const t of targets) await (await context({ ...common, ...t })).watch();
} else {
  for (const t of targets) await build({ ...common, ...t });
}
