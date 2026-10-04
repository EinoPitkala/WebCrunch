import { Decimal, evaluate as abicusEvaluate } from "./abicus-engine.js";

export class CalculatorSyntaxError extends Error {
  constructor(message, position, code = "unableToCalculate", values = {}) {
    super(message);
    this.name = "CalculatorSyntaxError";
    this.position = position;
    this.code = code;
    this.values = values;
  }
}

const NUMBER_PATTERN = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/;
const SUBSCRIPT_LOG_PATTERN =
  /^log_((?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/i;
const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*/;
const IDENTIFIER_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const FUNCTION_DEFINITION_PATTERN =
  /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*\(([^()]*)\)\s*=\s*([\s\S]+)$/;
const VARIABLE_ASSIGNMENT_PATTERN =
  /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([\s\S]+)$/;
export const BUILTIN_FUNCTIONS = Object.freeze([
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
const BUILTIN_FUNCTION_ARITIES = new Map(
  BUILTIN_FUNCTIONS.map((name) => {
    if (name === "nthrt") return [name, { min: 2, max: 2 }];
    if (name === "log") return [name, { min: 1, max: 2 }];
    return [name, { min: 1, max: 1 }];
  }),
);
const RESERVED_NAMES = new Set(["ans", "e", "pi", ...BUILTIN_FUNCTIONS]);
const MAX_FUNCTION_DEPTH = 32;

function normalizedName(name) {
  return name.toLowerCase();
}

function normalizeContext(context = {}) {
  return {
    ans: context.ans ?? null,
    variables:
      context.variables instanceof Map
        ? context.variables
        : new Map(
            Object.entries(context.variables ?? {}).map(([name, value]) => [
              normalizedName(name),
              value,
            ]),
          ),
    functions:
      context.functions instanceof Map
        ? context.functions
        : new Map(
            Object.entries(context.functions ?? {}).map(([name, definition]) => [
              normalizedName(name),
              definition,
            ]),
          ),
    locals: context.locals instanceof Map ? context.locals : new Map(),
    callStack: context.callStack instanceof Set ? context.callStack : new Set(),
    angleMode: context.angleMode === "deg" ? "deg" : "rad",
  };
}

function functionDomainError(name, position) {
  throw new CalculatorSyntaxError(
    `${name} is undefined for these arguments`,
    position,
    "functionDomain",
    { name },
  );
}

// All numerical operations, constants, and scientific functions are evaluated by Abicus.
function engine(tokens, angleMode = "rad", position = 0) {
  const result = abicusEvaluate(tokens, new Decimal(0), new Decimal(0), angleMode);
  if (result.isOk()) return result.value;
  const errors = {
    UNEXPECTED_EOF: ["Expression is incomplete", "incompleteExpression"],
    NO_RHS_BRACKET: ["Missing closing parenthesis", "missingClosingParenthesis"],
    NOT_A_NUMBER: ["Function is undefined for these arguments", "functionDomain"],
    TRIG_PRECISION: ["Function is undefined for these arguments", "functionDomain"],
    INFINITY: ["Result is outside the supported range (possibly division by zero)", "resultOutOfRange"],
  };
  const [message, code] = errors[result.error] ?? ["Unexpected expression", "unableToCalculate"];
  throw new CalculatorSyntaxError(message, position, code);
}
const literal = value => ({ type: "litr", value: new Decimal(value) });
const operator = name => ({ type: "oper", name });
function evaluateBuiltinFunction(name, args, angleMode, position) {
  const aliases = { arcsin: "asin", arccos: "acos", arctan: "atan", nthrt: "root", cbrt: "root", log: "log10" };
  if (name === "nthrt" && (!args[1].isInteger() || args[1].isZero() || (args[0].isZero() && args[1].isNegative()))) functionDomainError(name, position);
  if (name === "log" && args.length === 2) {
    if (args[0].lte(0) || args[1].lte(0) || args[1].eq(1)) functionDomainError(name, position);
    return engine([...functionTokens("ln", [args[0]]), operator("/"), ...functionTokens("ln", [args[1]])], angleMode, position);
  }
  if ((name === "log" || name === "ln") && args[0].lte(0)) functionDomainError(name, position);
  if (name === "cbrt") args = [...args, new Decimal(3)];
  try {
    return engine(functionTokens(aliases[name] ?? name, args), angleMode, position);
  } catch (error) {
    if (error.code === "functionDomain") error.values = { name };
    throw error;
  }
}
function functionTokens(name, args) {
  return [{ type: "func", name }, { type: "lbrk" }, ...args.flatMap((value, i) => i ? [{ type: "semi" }, literal(value)] : [literal(value)]), { type: "rbrk" }];
}

class ExpressionAdapter {
  constructor(source, context) {
    this.source = source;
    this.context = normalizeContext(context);
    this.position = 0;
  }

  parse() {
    this.skipWhitespace();
    if (this.position === this.source.length) {
      throw new CalculatorSyntaxError("Type an expression", 0, "typeExpression");
    }

    const value = this.parseAdditive();
    this.skipWhitespace();

    if (this.position !== this.source.length) {
      throw new CalculatorSyntaxError(
        `Unexpected “${this.source[this.position]}”`,
        this.position,
        "unexpectedCharacter",
        { character: this.source[this.position] },
      );
    }

    return this.ensureFinite(value);
  }

  parseAdditive() {
    const tokens = [];
    let needsOperand = true;
    while (true) {
      this.skipWhitespace();
      const character = this.source[this.position];
      if (character === undefined || /[);,]/.test(character)) break;
      if (/[+*/^−×÷-]/.test(character)) {
        this.position += 1;
        const name = ({ "−": "-", "×": "*", "÷": "/" })[character] ?? character;
        if (!(needsOperand && name === "+")) tokens.push(operator(name));
        needsOperand = true;
      } else {
        if (!needsOperand) {
          if (!this.hasImplicitFactorAhead()) break;
          tokens.push(operator("*"));
        }
        tokens.push(literal(this.parsePrimary()));
        needsOperand = false;
      }
    }
    return engine(tokens, this.context.angleMode, this.position);
  }

  // Compact log syntax consumes one signed power expression.
  parseUnary() {
    const tokens = [];
    while (this.consume("-")) tokens.push(operator("-"));
    tokens.push(literal(this.parsePrimary()));
    if (this.consume("^")) tokens.push(operator("^"), literal(this.parseUnary()));
    return engine(tokens, this.context.angleMode, this.position);
  }

  parsePrimary() {
    this.skipWhitespace();
    const start = this.position;

    if (this.consume("(")) {
      const value = this.parseAdditive();
      if (!this.consume(")")) {
        throw new CalculatorSyntaxError(
          "Missing closing parenthesis",
          start,
          "missingClosingParenthesis",
        );
      }
      return value;
    }

    const remainder = this.source.slice(this.position);
    const subscriptLogMatch = remainder.match(SUBSCRIPT_LOG_PATTERN);
    if (subscriptLogMatch) {
      this.position += subscriptLogMatch[0].length;
      this.skipWhitespace();
      if (this.position >= this.source.length) {
        throw new CalculatorSyntaxError(
          "Expression is incomplete",
          this.position,
          "incompleteExpression",
        );
      }

      const base = new Decimal(subscriptLogMatch[1]);
      const value = this.parseUnary();
      return this.ensureFinite(
        evaluateBuiltinFunction("log", [value, base], this.context.angleMode, start),
      );
    }

    const numberMatch = remainder.match(NUMBER_PATTERN);
    if (numberMatch) {
      this.position += numberMatch[0].length;
      return new Decimal(numberMatch[0]);
    }

    const identifierMatch = remainder.match(IDENTIFIER_PATTERN);
    if (identifierMatch) {
      const identifier = identifierMatch[0];
      this.position += identifier.length;
      this.skipWhitespace();

      const name = normalizedName(identifier);
      if (
        this.source[this.position] === "(" &&
        (BUILTIN_FUNCTION_ARITIES.has(name) || this.context.functions.has(name))
      ) {
        return this.parseFunctionCall(identifier, start);
      }

      return this.resolveIdentifier(identifier, start);
    }

    if (this.position >= this.source.length) {
      throw new CalculatorSyntaxError(
        "Expression is incomplete",
        this.position,
        "incompleteExpression",
      );
    }

    throw new CalculatorSyntaxError(
      `Expected a number at “${this.source[this.position]}”`,
      this.position,
      "expectedNumber",
      { character: this.source[this.position] },
    );
  }

  parseFunctionCall(identifier, position) {
    const name = normalizedName(identifier);
    const builtinArity = BUILTIN_FUNCTION_ARITIES.get(name);
    const definition =
      builtinArity === undefined
        ? this.context.functions.get(name)
        : { name, parameters: [] };
    const args = [];

    this.position += 1;
    this.skipWhitespace();

    if (this.source[this.position] === ")") {
      this.position += 1;
    } else {
      while (true) {
        args.push(this.parseAdditive());
        this.skipWhitespace();

        const separator = this.source[this.position];
        if (separator === ";" || separator === ",") {
          this.position += 1;
          this.skipWhitespace();
          if (this.source[this.position] === ")") {
            throw new CalculatorSyntaxError(
              "Expression is incomplete",
              this.position,
              "incompleteExpression",
            );
          }
          continue;
        }

        if (separator !== ")") {
          throw new CalculatorSyntaxError(
            "Missing closing parenthesis",
            position,
            "missingClosingParenthesis",
          );
        }

        this.position += 1;
        break;
      }
    }

    const minimumArguments = builtinArity?.min ?? definition.parameters.length;
    const maximumArguments = builtinArity?.max ?? definition.parameters.length;
    if (args.length < minimumArguments || args.length > maximumArguments) {
      if (minimumArguments !== maximumArguments) {
        throw new CalculatorSyntaxError(
          `${definition.name} expects ${minimumArguments} or ${maximumArguments} arguments`,
          position,
          "functionArgumentRange",
          { name: definition.name, min: minimumArguments, max: maximumArguments },
        );
      }

      const noun = minimumArguments === 1 ? "argument" : "arguments";
      throw new CalculatorSyntaxError(
        `${definition.name} expects ${minimumArguments} ${noun}`,
        position,
        "functionArgumentCount",
        { name: definition.name, count: minimumArguments },
      );
    }

    if (builtinArity !== undefined) {
      return this.ensureFinite(
        evaluateBuiltinFunction(name, args, this.context.angleMode, position),
      );
    }

    if (
      this.context.callStack.has(name) ||
      this.context.callStack.size >= MAX_FUNCTION_DEPTH
    ) {
      throw new CalculatorSyntaxError(
        `Recursive function call involving “${definition.name}”`,
        position,
        "recursiveFunction",
        { name: definition.name },
      );
    }

    const locals = new Map();
    definition.parameters.forEach((parameter, index) => {
      locals.set(parameter, args[index]);
    });

    const callStack = new Set(this.context.callStack);
    callStack.add(name);

    return new ExpressionAdapter(definition.body, {
      ans: this.context.ans,
      variables: this.context.variables,
      functions: this.context.functions,
      locals,
      callStack,
      angleMode: this.context.angleMode,
    }).parse();
  }

  resolveIdentifier(identifier, position) {
    const name = normalizedName(identifier);

    if (this.context.locals.has(name)) return this.context.locals.get(name);
    if (this.context.variables.has(name)) return this.context.variables.get(name);

    switch (name) {
      case "pi":
        return engine([{ type: "cons", name: "pi" }]);
      case "e":
        return engine([{ type: "cons", name: "e" }]);
      case "ans":
        if (this.context.ans === null || this.context.ans === undefined) {
          throw new CalculatorSyntaxError(
            "No previous answer",
            position,
            "noPreviousAnswer",
          );
        }
        return this.context.ans;
      default:
        throw new CalculatorSyntaxError(
          `Unknown name “${identifier}”`,
          position,
          "unknownName",
          { name: identifier },
        );
    }
  }

  hasImplicitFactorAhead() {
    this.skipWhitespace();
    const character = this.source[this.position] ?? "";
    return character === "(" || /[A-Za-z_]/.test(character);
  }

  consume(character) {
    this.skipWhitespace();
    if (this.source[this.position] !== character) return false;
    this.position += 1;
    return true;
  }

  skipWhitespace() {
    while (/\s/.test(this.source[this.position] ?? "")) this.position += 1;
  }

  ensureFinite(value) {
    if (!new Decimal(value).isFinite()) {
      throw new CalculatorSyntaxError(
        "Result is outside the supported range",
        this.position,
        "resultOutOfRange",
      );
    }
    return value;
  }
}

function splitTopLevelCommas(source) {
  const parts = [];
  let depth = 0;
  let start = 0;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;

    if (depth < 0) {
      throw new CalculatorSyntaxError(
        "Unexpected closing parenthesis",
        index,
        "unexpectedClosingParenthesis",
      );
    }

    if (character === "," && depth === 0) {
      parts.push(source.slice(start, index));
      start = index + 1;
    }
  }

  if (depth !== 0) {
    throw new CalculatorSyntaxError(
      "Missing closing parenthesis",
      source.length,
      "missingClosingParenthesis",
    );
  }

  parts.push(source.slice(start));
  return parts;
}

function assertDefinitionNameAvailable(name, context, kind) {
  if (RESERVED_NAMES.has(name)) {
    throw new CalculatorSyntaxError(
      `${name} is a reserved name`,
      0,
      "reservedName",
      { name },
    );
  }

  if (kind === "function" && context.variables.has(name)) {
    throw new CalculatorSyntaxError(
      `${name} is already a variable`,
      0,
      "alreadyVariable",
      { name },
    );
  }

  if (kind === "variable" && context.functions.has(name)) {
    throw new CalculatorSyntaxError(
      `${name} is already a function`,
      0,
      "alreadyFunction",
      { name },
    );
  }
}

function defineFunction(match, context) {
  const displayName = match[1];
  const name = normalizedName(displayName);
  const parameterSource = match[2].trim();
  const body = match[3].trim();

  assertDefinitionNameAvailable(name, context, "function");

  const parameters = parameterSource
    ? parameterSource.split(/[;,]/).map((parameter) => parameter.trim())
    : [];

  if (parameters.some((parameter) => !IDENTIFIER_NAME_PATTERN.test(parameter))) {
    throw new CalculatorSyntaxError(
      "Invalid function parameter",
      0,
      "invalidFunctionParameter",
    );
  }

  const normalizedParameters = parameters.map(normalizedName);
  const uniqueParameters = new Set(normalizedParameters);
  if (uniqueParameters.size !== normalizedParameters.length) {
    throw new CalculatorSyntaxError(
      "Function arguments must be unique",
      0,
      "uniqueFunctionArguments",
    );
  }

  const reservedParameter = normalizedParameters.find((parameter) =>
    RESERVED_NAMES.has(parameter),
  );
  if (reservedParameter) {
    throw new CalculatorSyntaxError(
      `${reservedParameter} is a reserved name`,
      0,
      "reservedName",
      { name: reservedParameter },
    );
  }

  splitTopLevelCommas(body);
  if (/[+\-*/^,;]\s*$/.test(body)) {
    throw new CalculatorSyntaxError(
      "Expression is incomplete",
      body.length,
      "incompleteExpression",
    );
  }

  const definition = {
    name: displayName,
    parameters: normalizedParameters,
    body,
  };
  context.functions.set(name, definition);

  return {
    kind: "function",
    definition,
    value: null,
  };
}

function defineVariables(parts, context) {
  const assignments = parts.map((part) => {
    const match = part.match(VARIABLE_ASSIGNMENT_PATTERN);
    if (!match) return null;
    return { displayName: match[1], name: normalizedName(match[1]), body: match[2] };
  });

  if (assignments.some((assignment) => assignment === null)) return null;

  const workingVariables = new Map(context.variables);
  const evaluatedAssignments = [];

  for (const assignment of assignments) {
    assertDefinitionNameAvailable(assignment.name, context, "variable");
    const value = evaluateExpression(assignment.body, {
      ...context,
      variables: workingVariables,
    });
    workingVariables.set(assignment.name, value);
    evaluatedAssignments.push({ name: assignment.displayName, value });
  }

  context.variables.clear();
  workingVariables.forEach((value, name) => context.variables.set(name, value));

  return {
    kind: "variables",
    assignments: evaluatedAssignments,
    value: evaluatedAssignments.at(-1).value,
  };
}

export function evaluateExpression(source, context = {}) {
  return new ExpressionAdapter(source, context).parse();
}

export function evaluateStatement(source, context = {}) {
  const normalizedContext = normalizeContext(context);
  const functionMatch = source.match(FUNCTION_DEFINITION_PATTERN);
  if (functionMatch) return defineFunction(functionMatch, normalizedContext);

  const parts = splitTopLevelCommas(source);
  const variableDefinition = defineVariables(parts, normalizedContext);
  if (variableDefinition) return variableDefinition;

  return {
    kind: "value",
    value: evaluateExpression(source, normalizedContext),
  };
}

export function formatStatementResult(statement) {
  if (statement.kind === "function") return "saved";
  if (statement.kind === "variables" && statement.assignments.length > 1) {
    return statement.assignments
      .map(({ value }) => formatResult(value))
      .join("; ");
  }
  return formatResult(statement.value);
}

export function formatResult(value) {
  const decimal = new Decimal(value);
  if (decimal.isZero()) return "0";
  return decimal.toSignificantDigits(21).toString().replace("e+", "e");
}

export function completeParentheses(source) {
  let unmatchedOpening = 0;

  for (const character of source) {
    if (character === "(") {
      unmatchedOpening += 1;
    } else if (character === ")") {
      if (unmatchedOpening === 0) return source;
      unmatchedOpening -= 1;
    }
  }

  return `${source}${")".repeat(unmatchedOpening)}`;
}
