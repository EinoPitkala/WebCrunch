import { build } from 'esbuild';
await build({
  stdin: { contents: 'export { tokenise, evaluate } from "./vendor/abicus/src/calculator/index.ts"; export { default as Decimal } from "decimal.js";', resolveDir: process.cwd() },
  bundle: true, format: 'esm', platform: 'browser', outfile: 'src/abicus-engine.js',
  alias: { '#': './vendor/abicus/src' }, define: { 'import.meta.env.DEV': 'false' },
  legalComments: 'eof',
});
