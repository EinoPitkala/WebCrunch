# WebCrunch

A keyboard-first calculator for browser-based examination environments.
WebCrunch is an independent web application inspired by SpeedCrunch's fast,
keyboard-driven interaction.

## Current scope

- Basic arithmetic: `+`, `-`, `*`, `/`, `^`, and parentheses
- Implicit multiplication such as `2x` and `5(a + b)`
- Decimal and scientific notation
- Constants `pi` and `e`
- Roots: `sqrt(x)`, `cbrt(x)`, and `nthrt(x; n)`
- Logarithms: base-10 `log(x)`, natural `ln(x)`, and arbitrary-base `log_b x`
- Trigonometry: `sin`, `cos`, `tan`, `arcsin`, `arccos`, and `arctan`
- Persistent radians/degrees angle mode; inverse functions use the same mode
- Previous result through `ans`
- Session variables with `x=2`
- Atomic batch assignment with `a=1, b=2, c=3`
- User functions with `f(x)=2x+1` and `f(2)`
- Multi-argument functions using the original `f(x; y)` syntax
- Tab completion for constants and saved variables/functions
- English, Finnish, and Swedish interface and calculator errors
- Locally remembered calculator font, size, and angle-mode preferences
- Enter to calculate
- Missing closing parentheses are appended when Enter submits an expression
- Enter focuses the expression field when the page background has focus
- Up/Down to browse expression history
- Escape to clear the current expression
- Ctrl/Cmd+Shift+L to clear the session
- Live result preview while typing
- History expressions and results are normal selectable, copyable text
- Installable as a standalone app on supported browsers
- Full calculator shell cached for offline use after the first visit

There are deliberately no units, CAS features, keypad, file operations, or
network dependencies in this first slice.

## Definitions

Definitions live for the current calculator session and are removed by Clear.
The syntax follows desktop SpeedCrunch, with comma-separated batch assignment
added for convenience:

```text
f(x)=2x+1
f(2)                  = 5
x=2
f(x)                  = 5

a=1, b=2, c=3
2a * 5b * (-5c)       = -300
```

Function parameters and arguments may be separated with semicolons, as in the
original application: `f(x; y)=x*y+x` and `f(2; 3)`.

Roots and trigonometry use function-call syntax:

```text
sqrt(81)              = 9
cbrt(-27)             = -3
nthrt(32; 5)          = 2
log(1000)             = 3
ln(e)                 = 1
log_2 8               = 3
log(2; 8)             = 3       (equivalent explicit syntax)
sin(pi / 2)           = 1       (radian mode)
sin(30)               = 0.5     (degree mode)
arctan(1)             = 45      (degree mode)
```

Type the beginning of a saved name and press Tab to accept the first completion.
For a function, completion inserts parentheses and leaves the cursor inside.

The small Settings menu provides English/Finnish/Swedish selection, radians/degrees,
monospace/sans/serif calculator fonts, and five font sizes. These preferences persist in
the local browser; calculations and definitions remain session-only.

## Run locally

Requires Node.js 20 or newer. No package installation is necessary.

```sh
npm run dev
```

Open <http://127.0.0.1:4173>.

The local server uses `localhost`, which browsers treat as a secure context, so
the service worker and install flow can be tested without HTTPS. Production
deployments must use HTTPS. After loading the app once, enable offline mode in
browser developer tools and reload to verify the cached calculator shell.

## Verify

```sh
npm run check
```

## Relationship to SpeedCrunch

WebCrunch is an independent browser-based calculator inspired by
[SpeedCrunch](https://bitbucket.org/heldercorreia/speedcrunch/).

The original SpeedCrunch source code is maintained separately and is licensed
under GPL-2.0-or-later. WebCrunch is not an official SpeedCrunch release.
