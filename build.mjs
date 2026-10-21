// Bundle src/main.js (GSAP + ScrollTrigger + Lenis + Three.js) into one classic script,
// so the site also opens straight from the file system – no dev server required.
import { build, context } from 'esbuild';

const options = {
  entryPoints: ['src/main.js'],
  outfile: 'assets/js/app.js',
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2019'],
  legalComments: 'none',
  logLevel: 'info',
};

if (process.argv.includes('--watch')) {
  const ctx = await context(options);
  await ctx.watch();
} else {
  await build(options);
}
