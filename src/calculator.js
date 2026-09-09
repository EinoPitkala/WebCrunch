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

function evaluateBuiltinFunction(name, args, angleMode, position) {
  const toRadians = (value) =>
    angleMode === "deg" ? (value * Math.PI) / 180 : value;
  const fromRadians = (value) =>
    angleMode === "deg" ? (value * 180) / Math.PI : value;

  switch (name) {
    case "sqrt":
      if (args[0] < 0) functionDomainError(name, position);
      return Math.sqrt(args[0]);
    case "cbrt":
      return Math.cbrt(args[0]);
    case "nthrt": {
      const [value, degree] = args;
      if (
        !Number.isInteger(degree) ||
        degree === 0 ||
        (value < 0 && Math.abs(degree) % 2 === 0) ||
        (value === 0 && degree < 0)
      ) {
        functionDomainError(name, position);
      }
      return Math.sign(value) * Math.abs(value) ** (1 / degree);
    }
    case "log":
      if (args.length === 1) {
        if (args[0] <= 0) functionDomainError(name, position);
        return Math.log10(args[0]);
      }
      if (args[0] <= 0 || args[0] === 1 || args[1] <= 0) {
        functionDomainError(name, position);
      }
      return Math.log(args[1]) / Math.log(args[0]);
    case "ln":
      if (args[0] <= 0) functionDomainError(name, position);
      return Math.log(args[0]);
    case "sin":
      return Math.sin(toRadians(args[0]));
    case "cos":
      return Math.cos(toRadians(args[0]));
    case "tan": {
      const angle = toRadians(args[0]);
      if (Math.abs(Math.cos(angle)) < 1e-15) {
        functionDomainError(name, position);
      }
      return Math.tan(angle);
    }
    case "arcsin":
      if (Math.abs(args[0]) > 1) functionDomainError(name, position);
      return fromRadians(Math.asin(args[0]));
    case "arccos":
      if (Math.abs(args[0]) > 1) functionDomainError(name, position);
      return fromRadians(Math.acos(args[0]));
    case "arctan":
      return fromRadians(Math.atan(args[0]));
    default:
      throw new CalculatorSyntaxError(
        `Unknown name “${name}”`,
        position,
        "unknownName",
        { name },
      );
  }
}

class Parser {
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
    let value = this.parseMultiplicative();

    while (true) {
      if (this.consume("+")) {
        value += this.parseMultiplicative();
      } else if (this.consume("-")) {
        value -= this.parseMultiplicative();
      } else {
        return this.ensureFinite(value);
      }
    }
  }

  parseMultiplicative() {
    let value = this.parseUnary();

    while (true) {
      if (this.consume("*")) {
        value *= this.parseUnary();
      } else if (this.consume("/")) {
        const divisorPosition = this.position;
        const divisor = this.parseUnary();
        if (divisor === 0) {
          throw new CalculatorSyntaxError(
            "Division by zero",
            divisorPosition,
            "divisionByZero",
          );
        }
        value /= divisor;
      } else if (this.hasImplicitFactorAhead()) {
        value *= this.parseUnary();
      } else {
        return this.ensureFinite(value);
      }
    }
  }

  parseUnary() {
    if (this.consume("+")) return this.parseUnary();
    if (this.consume("-")) return -this.parseUnary();
    return this.parsePower();
  }

  parsePower() {
    const base = this.parsePrimary();
    if (!this.consume("^")) return base;

    const exponent = this.parseUnary();
    return this.ensureFinite(base ** exponent);
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

      const base = Number(subscriptLogMatch[1]);
      const value = this.parseUnary();
      return this.ensureFinite(
        evaluateBuiltinFunction("log", [base, value], this.context.angleMode, start),
      );
    }

    const numberMatch = remainder.match(NUMBER_PATTERN);
    if (numberMatch) {
      this.position += numberMatch[0].length;
      return Number(numberMatch[0]);
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

    return new Parser(definition.body, {
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
        return Math.PI;
      case "e":
        return Math.E;
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
    if (!Number.isFinite(value)) {
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
  return new Parser(source, context).parse();
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
  if (Object.is(value, -0) || value === 0) return "0";

  const magnitude = Math.abs(value);
  if (magnitude >= 1e15 || magnitude < 1e-9) {
    return value
      .toExponential(12)
      .replace(/\.?(0+)(?=e)/, "")
      .replace("e+", "e");
  }

  return Number(value.toPrecision(15)).toString();
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
