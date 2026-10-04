# Abicus engine

Source: https://github.com/digabi/abicus
Commit: 917a27a791da77c29c02aa6b10a987bd57233012 (version 1.1.5)
License: MIT; see LICENCE.md. Bundled dependency licenses are in licenses/.

The calculator, its original tests, and supporting test utilities are copied
unchanged from this revision. `npm run build:engine` bundles the engine and its
pinned dependencies into `src/abicus-engine.js` for offline static hosting.
The build resolves the upstream `#/` alias and disables its development-only
simulated-error hook. `npm test` includes the original Abicus engine tests.

WebCrunch's `src/calculator.js` adapts session definitions, implicit
multiplication, scientific notation, and function aliases into Abicus tokens.
Abicus owns arithmetic, precedence, constants, and scientific evaluation.
Arbitrary-base logs are expressed as ln(value)/ln(base) through Abicus.
Values remain Decimal objects throughout the session; display rounds to 21
significant digits without rounding stored values. Upstream range and precision
behavior applies, including rejection of tangent near its singularities.
