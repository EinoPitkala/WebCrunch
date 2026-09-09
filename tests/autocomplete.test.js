import test from "node:test";
import assert from "node:assert/strict";

import {
  applyCompletion,
  completionRange,
  findCompletions,
} from "../src/autocomplete.js";

test("finds the identifier at the cursor", () => {
  assert.deepEqual(completionRange("2 + va", 6), {
    start: 4,
    end: 6,
    fragment: "va",
  });
  assert.equal(completionRange("2 + ", 4), null);
});

test("suggests saved variables, functions, and constants", () => {
  const context = {
    variables: new Map([["velocity", 12]]),
    functions: new Map([
      ["volume", { name: "volume", parameters: ["r"], body: "r^3" }],
    ]),
  };

  const { suggestions } = findCompletions("v", 1, context);
  assert.deepEqual(suggestions, [
    { name: "velocity", kind: "variable", insertion: "velocity" },
    { name: "volume", kind: "function", insertion: "volume()" },
  ]);

  assert.deepEqual(findCompletions("p", 1, context).suggestions[0], {
    name: "pi",
    kind: "constant",
    insertion: "pi",
  });
});

test("suggests built-in calculator functions", () => {
  const { suggestions } = findCompletions("sq", 2, {
    builtins: ["sqrt", "cbrt"],
  });

  assert.deepEqual(suggestions[0], {
    name: "sqrt",
    kind: "function",
    insertion: "sqrt()",
  });
});

test("offers parentheses for an exactly typed function name", () => {
  const context = {
    functions: new Map([
      ["f", { name: "f", parameters: ["x"], body: "x" }],
    ]),
  };

  assert.deepEqual(findCompletions("f", 1, context).suggestions[0], {
    name: "f",
    kind: "function",
    insertion: "f()",
  });
});

test("places the cursor inside completed function parentheses", () => {
  const completed = applyCompletion(
    "2 + vol",
    { start: 4, end: 7, fragment: "vol" },
    { name: "volume", kind: "function", insertion: "volume()" },
  );

  assert.deepEqual(completed, { value: "2 + volume()", cursor: 11 });
});
