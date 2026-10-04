import { Decimal } from '../../src/abicus-engine.js';
import { evaluateStatement, formatStatementResult, completeParentheses } from '../../src/calculator.js';
import { translate, translateCalculatorError } from '../../src/i18n.js';
let state = { ans: null, variables: new Map(), functions: new Map() };
export function request(input) {
  const { action, expression = '', angle = 'rad', locale = 'fi' } = input;
  try {
    if (action === 'restore') {
      const saved = JSON.parse(input.snapshot);
      const restored = {
        ans: saved.ans == null ? null : new Decimal(saved.ans),
        variables: new Map(saved.variables.map(([key, value]) => [key, new Decimal(value)])),
        functions: new Map(saved.functions),
      };
      state = restored;
      return JSON.stringify({ ok: true });
    }
    if (action === 'clear') {
      state = { ans: null, variables: new Map(), functions: new Map() };
      return JSON.stringify({ ok: true });
    }
    if (action === 'translate') return JSON.stringify({ ok: true, result: translate(locale, input.key) });
    const source = action === 'commit' ? completeParentheses(expression.trim()) : expression.trim();
    if (source.length > 4000) return JSON.stringify({ ok: false, error: translate(locale, 'unableToCalculate') });
    // Preview never changes definitions, variables, or the previous answer.
    const context = { ...state, variables: new Map(state.variables), functions: new Map(state.functions), angleMode: angle };
    const statement = evaluateStatement(source, context);
    const result = statement.kind === 'function' ? translate(locale, 'saved') : formatStatementResult(statement);
    if (action === 'commit') {
      state.variables = context.variables;
      state.functions = context.functions;
      if (statement.kind !== 'function') state.ans = statement.value;
    }
    return JSON.stringify({ ok: true, expression: source, result, kind: statement.kind,
      snapshot: action === 'commit' ? JSON.stringify({ ans: state.ans?.toString() ?? null,
        variables: [...state.variables].map(([key, value]) => [key, value.toString()]), functions: [...state.functions] }) : null });
  } catch (error) {
    return JSON.stringify({ ok: false, error: translateCalculatorError(locale, error) });
  }
}
