import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
await build({ absWorkingDir: root, entryPoints: ['ios/scripts/bridge.js'], bundle: true,
  format: 'iife', globalName: 'WebCrunchBridge', platform: 'browser', target: 'safari17',
  outfile: 'ios/WebCrunch/Resources/calculator.js', legalComments: 'eof' });
