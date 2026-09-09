import test from "node:test";
import assert from "node:assert/strict";

import {
  BUILTIN_FUNCTIONS,
  CalculatorSyntaxError,
  completeParentheses,
  evaluateExpression,
  evaluateStatement,
  formatResult,
  formatStatementResult,
} from "../src/calculator.js";

function assertClose(actual, expected, tolerance = 1e-12) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

test("completes unmatched opening parentheses on submission", () => {
  assert.equal(completeParentheses("2 * (3 + 4"), "2 * (3 + 4)");
  assert.equal(completeParentheses("f((2 + 3"), "f((2 + 3))");
  assert.equal(completeParentheses("(2 + 3)"), "(2 + 3)");
});

test("does not hide an unexpected closing parenthesis", () => {
  assert.equal(completeParentheses("2 + )3("), "2 + )3(");
});

test("evaluates arithmetic precedence", () => {
  assert.equal(evaluateExpression("2 + 3 * 4"), 14);
  assert.equal(evaluateExpression("(2 + 3) * 4"), 20);
});

test("gives exponentiation precedence over unary signs", () => {
  assert.equal(evaluateExpression("-2^2"), -4);
  assert.equal(evaluateExpression("(-2)^2"), 4);
  assert.equal(evaluateExpression("2^-2"), 0.25);
});

test("evaluates powers right-to-left", () => {
  assert.equal(evaluateExpression("2^3^2"), 512);
});

test("supports decimals and scientific notation", () => {
  assert.equal(evaluateExpression(".5 + 1.5"), 2);
  assert.equal(evaluateExpression("2e3 / 4"), 500);
});

test("resolves constants without case sensitivity", () => {
  assert.equal(evaluateExpression("PI"), Math.PI);
  assert.equal(evaluateExpression("e"), Math.E);
});

test("evaluates square, cube, and integer nth roots", () => {
  assert.equal(evaluateExpression("sqrt(81)"), 9);
  assert.equal(evaluateExpression("cbrt(-27)"), -3);
  assert.equal(evaluateExpression("nthrt(32; 5)"), 2);
  assert.equal(evaluateExpression("nthrt(-8, 3)"), -2);
  assert.equal(evaluateExpression("nthrt(16; -2)"), 0.25);
});

test("evaluates common and natural logarithms", () => {
  assert.equal(evaluateExpression("log(1000)"), 3);
  assertClose(evaluateExpression("ln(e)"), 1);
  assertClose(evaluateExpression("ln(2)"), Math.LN2);
});

test("evaluates arbitrary-base logarithms with compact and explicit syntax", () => {
  assert.equal(evaluateExpression("log_2 8"), 3);
  assertClose(evaluateExpression("log_5 125"), 3);
  assertClose(evaluateExpression("log_0.5 4"), -2);
  assert.equal(evaluateExpression("log_2 (8 * 4)"), 5);
  assert.equal(evaluateExpression("log(2; 8)"), 3);

  const context = { variables: new Map(), functions: new Map() };
  evaluateStatement("base=2", context);
  assert.equal(evaluateExpression("log(base; 8)", context), 3);
});

test("evaluates trigonometry in radians by default", () => {
  assertClose(evaluateExpression("sin(pi / 2)"), 1);
  assertClose(evaluateExpression("cos(0)"), 1);
  assertClose(evaluateExpression("tan(pi / 4)"), 1);
  assertClose(evaluateExpression("arcsin(0.5)"), Math.PI / 6);
  assertClose(evaluateExpression("arccos(0)"), Math.PI / 2);
  assertClose(evaluateExpression("arctan(1)"), Math.PI / 4);
});

test("evaluates trigonometry and inverse results in degrees", () => {
  const context = { angleMode: "deg" };
  assertClose(evaluateExpression("sin(30)", context), 0.5);
  assertClose(evaluateExpression("cos(60)", context), 0.5);
  assertClose(evaluateExpression("tan(45)", context), 1);
  assertClose(evaluateExpression("arcsin(0.5)", context), 30);
  assertClose(evaluateExpression("arccos(0)", context), 90);
  assertClose(evaluateExpression("arctan(1)", context), 45);
});

test("passes angle mode through saved functions", () => {
  const context = {
    angleMode: "deg",
    variables: new Map(),
    functions: new Map(),
  };
  evaluateStatement("wave(x)=sin(x)", context);
  assertClose(evaluateExpression("wave(30)", context), 0.5);
});

test("validates built-in function arity and real-number domains", () => {
  assert.deepEqual(BUILTIN_FUNCTIONS, [
    "sqrt",
    "cbrt",
    "nthrt",
    "log",
    "ln",
    "sin",
    "cos",
    "tan",
    "arcsin",
    "arccos",
    "arctan",
  ]);
  assert.throws(() => evaluateExpression("sqrt(-1)"), /undefined/);
  assert.throws(() => evaluateExpression("nthrt(-16; 2)"), /undefined/);
  assert.throws(() => evaluateExpression("nthrt(16; 2.5)"), /undefined/);
  assert.throws(() => evaluateExpression("nthrt(16; 0)"), /undefined/);
  assert.throws(() => evaluateExpression("arcsin(2)"), /undefined/);
  assert.throws(() => evaluateExpression("log(0)"), /undefined/);
  assert.throws(() => evaluateExpression("log(1; 8)"), /undefined/);
  assert.throws(() => evaluateExpression("log(-2; 8)"), /undefined/);
  assert.throws(() => evaluateExpression("log(2; 0)"), /undefined/);
  assert.throws(() => evaluateExpression("log_1 8"), /undefined/);
  assert.throws(() => evaluateExpression("log_2"), /incomplete/);
  assert.throws(() => evaluateExpression("log()"), /expects 1 or 2 arguments/);
  assert.throws(() => evaluateExpression("log(2; 8; 16)"), /expects 1 or 2 arguments/);
  assert.throws(() => evaluateExpression("ln(-1)"), /undefined/);
  assert.throws(() => evaluateExpression("tan(90)", { angleMode: "deg" }), /undefined/);
  assert.throws(() => evaluateExpression("sqrt(1; 2)"), /expects 1 argument/);
});

test("reserves built-in function names", () => {
  assert.throws(() => evaluateStatement("sqrt=4"), /reserved/);
  assert.throws(() => evaluateStatement("sin(x)=x"), /reserved/);
  assert.throws(() => evaluateStatement("log=10"), /reserved/);
});

test("uses ans only when a previous answer exists", () => {
  assert.equal(evaluateExpression("ans * 4", { ans: 3 }), 12);
  assert.throws(
    () => evaluateExpression("ans + 1", { ans: null }),
    /No previous answer/,
  );
});

test("rejects unsafe or unsupported syntax", () => {
  assert.throws(() => evaluateExpression("globalThis"), /Unknown name/);
  assert.throws(() => evaluateExpression("2; 3"), /Unexpected/);
  assert.throws(() => evaluateExpression("2 +"), /incomplete/);
});

test("reports division by zero", () => {
  assert.throws(
    () => evaluateExpression("10 / 0"),
    (error) => error instanceof CalculatorSyntaxError && error.message === "Division by zero",
  );
});

test("formats everyday floating point results compactly", () => {
  assert.equal(formatResult(0.1 + 0.2), "0.3");
  assert.equal(formatResult(-0), "0");
  assert.equal(formatResult(1e20), "1e20");
});

test("stores and reuses variables", () => {
  const context = { variables: new Map(), functions: new Map(), ans: null };

  const assignment = evaluateStatement("x = 2", context);
  assert.equal(assignment.kind, "variables");
  assert.equal(assignment.value, 2);
  assert.equal(evaluateExpression("2x + 1", context), 5);
});

test("supports atomic comma-separated variable assignments", () => {
  const context = { variables: new Map(), functions: new Map(), ans: null };

  const statement = evaluateStatement("a=1, b=2a, c=a+b", context);
  assert.deepEqual(statement.assignments, [
    { name: "a", value: 1 },
    { name: "b", value: 2 },
    { name: "c", value: 3 },
  ]);
  assert.equal(formatStatementResult(statement), "1; 2; 3");
  assert.equal(evaluateExpression("2a * 5b * (-5c)", context), -300);

  assert.throws(() => evaluateStatement("a=9, broken=unknown", context), /Unknown/);
  assert.equal(context.variables.get("a"), 1);
});

test("saves and invokes user-defined functions", () => {
  const context = { variables: new Map(), functions: new Map(), ans: null };

  const definition = evaluateStatement("f(x)=2x+1", context);
  assert.equal(definition.kind, "function");
  assert.equal(formatStatementResult(definition), "saved");
  assert.equal(evaluateExpression("f(2)", context), 5);

  evaluateStatement("x=2", context);
  assert.equal(evaluateExpression("f(x)", context), 5);
});

test("supports multiple function parameters with original separators", () => {
  const context = { variables: new Map(), functions: new Map(), ans: null };

  evaluateStatement("multiplyAdd(x; y)=x*y+x", context);
  assert.equal(evaluateExpression("multiplyAdd(2; 3)", context), 8);
  assert.equal(evaluateExpression("multiplyAdd(2, 3)", context), 8);
});

test("allows function composition and variables resolved at call time", () => {
  const context = { variables: new Map(), functions: new Map(), ans: null };

  evaluateStatement("outer(x)=10x+inner(x)", context);
  assert.throws(() => evaluateExpression("outer(2)", context), /Unknown name/);
  evaluateStatement("inner(x)=x-5", context);
  assert.equal(evaluateExpression("outer(2)", context), 17);

  evaluateStatement("offset=4", context);
  evaluateStatement("shift(x)=x+offset", context);
  assert.equal(evaluateExpression("shift(3)", context), 7);
  evaluateStatement("offset=10", context);
  assert.equal(evaluateExpression("shift(3)", context), 13);
});

test("function parameters shadow variables and recursion is rejected", () => {
  const context = { variables: new Map(), functions: new Map(), ans: null };

  evaluateStatement("x=100", context);
  evaluateStatement("identity(x)=x", context);
  assert.equal(evaluateExpression("identity(3)", context), 3);

  evaluateStatement("loop(x)=x loop(x)", context);
  assert.throws(() => evaluateExpression("loop(1)", context), /Recursive/);
});

test("rejects invalid definitions and argument counts", () => {
  const context = { variables: new Map(), functions: new Map(), ans: null };

  assert.throws(() => evaluateStatement("pi=3", context), /reserved/);
  assert.throws(() => evaluateStatement("f(x;x)=x", context), /unique/);
  assert.throws(() => evaluateStatement("f(x)=x+", context), /incomplete/);

  evaluateStatement("f(x)=x", context);
  assert.throws(() => evaluateExpression("f()", context), /expects 1 argument/);
  assert.throws(() => evaluateStatement("f=2", context), /already a function/);
});
