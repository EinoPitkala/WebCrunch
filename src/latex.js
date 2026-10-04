// Translate mathematical notation only. Abicus still performs all evaluation.
export class LatexPasteError extends Error {
  constructor() {
    super("unsupportedLatex");
    this.code = "unsupportedLatex";
  }
}

const FUNCTIONS = new Map([
  ["sin", "sin"], ["cos", "cos"], ["tan", "tan"],
  ["arcsin", "arcsin"], ["arccos", "arccos"], ["arctan", "arctan"],
  ["ln", "ln"], ["log", "log"], ["lg", "log"],
]);

export function convertLatexPaste(text) {
  if (!/[\\${}]/.test(text)) return text;
  if (text.length > 20000) throw new LatexPasteError();
  let source = text.trim();
  for (const [left, right] of [["$$", "$$"], ["$", "$"], ["\\(", "\\)"], ["\\[", "\\]"]]) {
    if (source.startsWith(left) && source.endsWith(right)) {
      source = source.slice(left.length, -right.length);
      break;
    }
  }
  // These commands affect layout, not mathematical meaning.
  source = source.replace(/\\(?:left|right|displaystyle|textstyle)\b/g, "")
    .replace(/\\(?:quad|qquad)\b|\\[,!;: ]/g, " ")
    .replace(/\\(?:cdot|times)\b/g, "*")
    .replace(/\\div\b/g, "/")
    .replace(/[−]/g, "-");
  const tokens = source.match(/\\[A-Za-z]+|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[A-Za-z][A-Za-z0-9]*|[^\s]/g) ?? [];
  // Adjacent numeric tokens (for example 1\,000) are ambiguous digit grouping.
  // Reject rather than silently interpreting them as multiplication.
  if (tokens.some((token, i) => /^\d/.test(token) && /^\d/.test(tokens[i - 1] ?? ""))) {
    throw new LatexPasteError();
  }
  let index = 0;
  let depth = 0;
  const fail = () => { throw new LatexPasteError(); };
  const take = expected => { if (tokens[index++] !== expected) fail(); };

  function group(open, close) {
    take(open);
    const value = sequence(close);
    take(close);
    return value;
  }

  function argument() {
    if (tokens[index] === "{") return group("{", "}");
    if (tokens[index] === "(") return group("(", ")");
    return atom();
  }

  function atom() {
    if (++depth > 100) fail();
    let value;
    const token = tokens[index++];
    if (token === "{" || token === "(" || token === "[") {
      index--;
      value = `(${group(token, { "{": "}", "(": ")", "[": "]" }[token])})`;
    } else if (["\\frac", "\\dfrac", "\\tfrac"].includes(token)) {
      const numerator = argument();
      const denominator = argument();
      value = `((${numerator})/(${denominator}))`;
    } else if (token === "\\sqrt") {
      const degree = tokens[index] === "[" ? group("[", "]") : null;
      const radicand = argument();
      value = degree === null ? `sqrt(${radicand})` : `nthrt(${radicand};${degree})`;
    } else if (token === "\\pi") {
      value = "pi";
    } else if (token === "\\mathrm" || token === "\\operatorname") {
      take("{");
      const name = tokens[index++];
      take("}");
      if (name === "e" || name === "pi" || name === "ans") value = name;
      else if (FUNCTIONS.has(name)) value = functionCall(name);
      else fail();
    } else if (token?.startsWith("\\") && FUNCTIONS.has(token.slice(1))) {
      value = functionCall(token.slice(1));
    } else if (token && /^(?:[A-Za-z][A-Za-z0-9]*|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)$/.test(token)) {
      value = token;
      // Preserve ordinary function-call syntax inside a LaTeX wrapper.
      if (/^[A-Za-z]/.test(token) && tokens[index] === "(") value += `(${group("(", ")")})`;
    } else fail();
    if (tokens[index] === "^") {
      index++;
      const sign = tokens[index] === "-" || tokens[index] === "+" ? tokens[index++] : "";
      value = `(${value})^(${sign}${argument()})`;
    }
    depth--;
    return value;
  }

  function functionCall(name) {
    let base = null;
    let power = null;
    if (name === "log" && tokens[index] === "_") {
      index++;
      base = argument();
    }
    if (tokens[index] === "^") {
      index++;
      power = argument();
      // Inverse trigonometric notation must not become a reciprocal.
      if (power === "-1" && ["sin", "cos", "tan"].includes(name)) {
        name = `arc${name}`;
        power = null;
      }
    }
    const value = argument();
    const call = base === null ? `${FUNCTIONS.get(name)}(${value})` : `log(${value};${base})`;
    return power === null ? call : `(${call})^(${power})`;
  }

  function sequence(close) {
    const output = [];
    let previousAtom = false;
    while (index < tokens.length && tokens[index] !== close) {
      const token = tokens[index];
      if (["+", "-", "*", "/", "=", ";", ","].includes(token)) {
        index++;
        output.push(token);
        previousAtom = false;
      } else {
        if (previousAtom) output.push("*");
        output.push(atom());
        previousAtom = true;
      }
    }
    if (!output.length) fail();
    return output.join("");
  }

  const result = sequence();
  if (index !== tokens.length) fail();
  return result;
}

export function handleLatexPaste(event, input, onError) {
  const text = event.clipboardData?.getData("text/plain");
  if (!text) return;
  let converted;
  try {
    converted = convertLatexPaste(text);
  } catch (error) {
    if (!(error instanceof LatexPasteError)) throw error;
    // Never partially convert unsupported notation or overwrite the current input.
    event.preventDefault();
    onError(error);
    return;
  }
  if (converted === text) return;
  event.preventDefault();
  input.setRangeText(converted, input.selectionStart, input.selectionEnd, "end");
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
