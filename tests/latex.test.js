import test from "node:test";
import assert from "node:assert/strict";
import { convertLatexPaste, handleLatexPaste, LatexPasteError } from "../src/latex.js";
import { evaluateExpression, formatResult } from "../src/calculator.js";
import { translate } from "../src/i18n.js";

const cases = [
  [String.raw`\frac{1+\frac{3}{2}}{\sqrt{25}}`, "0.5"],
  [String.raw`\dfrac{2^3+\sqrt[3]{27}}{\tfrac{11}{2}}`, "2"],
  [String.raw`$$\left(\frac{3}{4}+\frac{1}{4}\right)^{12}$$`, "1"],
  [String.raw`\[\sqrt{3^{2}+4^{2}}+\sqrt[5]{32}\]`, "7"],
  [String.raw`\(2\pi/\pi+6\times 4\div 2-3\cdot 2\)`, "8"],
  [String.raw`\log_{2}{32}+\ln{\mathrm{e}}+\log 100`, "8"],
  [String.raw`\sin^{2}(\pi/6)+\cos^{2}(\pi/6)`, "1"],
  [String.raw`\sin^{-1}(0.5)+\arccos(0.5)+\arctan(1)`, "135", "deg"],
  [String.raw`\operatorname{sin}\left(30\right)+\cos{60}`, "1", "deg"],
  [String.raw`\frac{1}{2}\frac{3}{4}+2\sqrt{9}`, "6.375"],
  [String.raw`$10^{-3}+2^{3^2}$`, "512.001"],
];
for (const [latex, expected, angleMode = "rad"] of cases) {
  test(`evaluates pasted ${latex}`, () => {
    assert.equal(formatResult(evaluateExpression(convertLatexPaste(latex), { angleMode })), expected);
  });
}

test("leaves ordinary calculator text untouched", () => {
  for (const text of ["2 + 3", "f(x)=2x+1", "a=1, b=2", "log_2 8", "1e-3"]) {
    assert.equal(convertLatexPaste(text), text);
  }
});

test("rejects unsupported and incomplete notation without dropping commands", () => {
  for (const text of [String.raw`\frac{1\,000}{2}`, String.raw`\sum_{i=1}^{5}i`, String.raw`\frac{1}`, String.raw`\sqrt{9`, String.raw`\text{m}`, String.raw`\alpha+1`, "$2+3", String.raw`\sin`, String.raw`30^{\circ}`, String.raw`\begin{matrix}1\end{matrix}`]) {
    assert.throws(() => convertLatexPaste(text), LatexPasteError);
  }
  assert.throws(() => convertLatexPaste("$" + "{".repeat(150) + "1" + "}".repeat(150) + "$"), LatexPasteError);
});

function fixture(text, start = 2, end = 3) {
  const input = {
    value: "1+9+4", selectionStart: start, selectionEnd: end,
    setRangeText(value, from, to, mode) {
      assert.equal(mode, "end");
      this.value = this.value.slice(0, from) + value + this.value.slice(to);
      this.selectionStart = this.selectionEnd = from + value.length;
    },
    dispatchEvent(event) { this.event = event; },
  };
  const event = { clipboardData: { getData: () => text }, preventDefault() { this.prevented = true; } };
  return { input, event };
}

test("paste replaces only selection and refreshes preview through input event", () => {
  const { input, event } = fixture(String.raw`\frac{6}{2}`);
  handleLatexPaste(event, input, () => assert.fail("unexpected error"));
  assert.equal(input.value, "1+((6)/(2))+4");
  assert.equal(input.selectionStart, input.value.length - 2);
  assert.equal(event.prevented, true);
  assert.equal(input.event.type, "input");
  assert.equal(input.event.bubbles, true);
});

test("ordinary paste keeps native browser behavior", () => {
  const { input, event } = fixture("2+3");
  handleLatexPaste(event, input, () => assert.fail("unexpected error"));
  assert.equal(event.prevented, undefined);
  assert.equal(input.event, undefined);
});

test("failed conversion preserves input and reports a localized error", () => {
  const { input, event } = fixture(String.raw`\int x`);
  let error;
  handleLatexPaste(event, input, value => { error = value; });
  assert.equal(input.value, "1+9+4");
  assert.equal(event.prevented, true);
  assert.equal(error.code, "unsupportedLatex");
  for (const locale of ["en", "fi", "sv"]) assert.notEqual(translate(locale, error.code), error.code);
});
