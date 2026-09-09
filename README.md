# WebCrunch

A keyboard-first calculator prototype for a browser-based examination
environment. WebCrunch preserves the essential interaction of SpeedCrunch
before the maintained C++ engine is connected through WebAssembly.

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

## Verify

```sh
npm run check
```
