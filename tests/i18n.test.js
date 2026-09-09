import test from "node:test";
import assert from "node:assert/strict";

import { CalculatorSyntaxError } from "../src/calculator.js";
import {
  normalizeLocale,
  translate,
  translateCalculatorError,
} from "../src/i18n.js";

test("normalizes supported locales and falls back to English", () => {
  assert.equal(normalizeLocale("fi-FI"), "fi");
  assert.equal(normalizeLocale("en-GB"), "en");
  assert.equal(normalizeLocale("sv-FI"), "sv");
  assert.equal(normalizeLocale("sv-SE"), "sv");
  assert.equal(normalizeLocale("de-DE"), "en");
});

test("translates interface text into Finnish", () => {
  assert.equal(translate("fi", "settings"), "Asetukset");
  assert.equal(translate("fi", "clearInput"), "tyhjennä syöte");
  assert.equal(translate("fi", "angleMode"), "Kulmayksikkö");
});

test("translates interface and calculator errors into Swedish", () => {
  assert.equal(translate("sv", "settings"), "Inställningar");
  assert.equal(translate("sv", "clearInput"), "rensa inmatningen");
  assert.equal(translate("sv", "degrees"), "Grader");

  const unknown = new CalculatorSyntaxError(
    "Unknown name",
    0,
    "unknownName",
    { name: "foo" },
  );
  assert.equal(
    translateCalculatorError("sv", unknown),
    "Okänt namn “foo”",
  );

  const arity = new CalculatorSyntaxError(
    "f expects 2 arguments",
    0,
    "functionArgumentCount",
    { name: "f", count: 2 },
  );
  assert.equal(
    translateCalculatorError("sv", arity),
    "f förväntar sig 2 argument",
  );
});

test("translates structured calculator errors", () => {
  const unknown = new CalculatorSyntaxError(
    "Unknown name “foo”",
    0,
    "unknownName",
    { name: "foo" },
  );
  assert.equal(translateCalculatorError("fi", unknown), "Tuntematon nimi “foo”");

  const arity = new CalculatorSyntaxError(
    "f expects 2 arguments",
    0,
    "functionArgumentCount",
    { name: "f", count: 2 },
  );
  assert.equal(
    translateCalculatorError("fi", arity),
    "f odottaa 2 argumenttia",
  );
});
