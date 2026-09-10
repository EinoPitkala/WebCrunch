# WebCrunch contributor guidance

## Project shape

- WebCrunch is a dependency-free static web app. Keep production code in native
  HTML, CSS, and browser ES modules unless a task explicitly changes that constraint.
- `index.html` owns document structure, `src/app.js` owns UI state and events,
  `src/calculator.js` owns parsing/evaluation, `src/autocomplete.js` owns completion,
  and `src/i18n.js` owns all translated user-facing strings.
- Tests use Node's built-in test runner. The local development server is
  `scripts/serve.mjs`; there is no compile or bundle step.

## Working agreement

- Run `npm run check` before handing off a change.
- Preserve the keyboard-first workflow and accessible names, focus states, live
  announcements, and semantic controls.
- Add user-facing copy to every supported locale rather than embedding it directly
  in application logic.
- Keep calculator changes deterministic and covered by focused tests. Do not use
  `eval`, `Function`, or remote math services.
- Avoid runtime dependencies and third-party network requests so the calculator
  remains suitable for offline and examination use.

## PWA contract

- `manifest.webmanifest` and `service-worker.js` live at the repository root so
  their scope covers the entire application.
- Every file required for a cold offline launch belongs in `APP_SHELL`. Update its
  cache name when cache behavior changes, and keep `tests/pwa.test.js` passing.
- Preserve relative URLs: the app must work both at a domain root and below a path.
- Production hosting must use HTTPS. The development server may use localhost,
  which browsers accept as a secure context for service workers.
