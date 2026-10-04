import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  resolve: { alias: { '#': fileURLToPath(new URL('./vendor/abicus/src', import.meta.url)) } },
  test: { globals: true, include: ['vendor/abicus/**/*.spec.ts'] },
});
