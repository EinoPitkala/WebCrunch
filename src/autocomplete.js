const IDENTIFIER_END_PATTERN = /[A-Za-z_][A-Za-z0-9_]*$/;

export function completionRange(value, cursor = value.length) {
  const safeCursor = Math.max(0, Math.min(cursor, value.length));
  const prefix = value.slice(0, safeCursor);
  const match = prefix.match(IDENTIFIER_END_PATTERN);
  if (!match) return null;

  return {
    start: safeCursor - match[0].length,
    end: safeCursor,
    fragment: match[0],
  };
}

export function findCompletions(value, cursor, context = {}) {
  const range = completionRange(value, cursor);
  if (!range || range.fragment.length === 0) return { range, suggestions: [] };

  const fragment = range.fragment.toLowerCase();
  const suggestions = [];
  const seen = new Set();

  const add = (name, kind, insertion = name) => {
    const normalized = name.toLowerCase();
    if (
      seen.has(normalized) ||
      (normalized === fragment && insertion === name) ||
      !normalized.startsWith(fragment)
    ) {
      return;
    }
    seen.add(normalized);
    suggestions.push({ name, kind, insertion });
  };

  for (const name of ["ans", "e", "pi"]) add(name, "constant");

  for (const name of context.builtins ?? []) {
    add(name, "function", `${name}()`);
  }

  for (const name of context.variables?.keys?.() ?? []) {
    add(name, "variable");
  }

  for (const [name, definition] of context.functions?.entries?.() ?? []) {
    const displayName = definition.name ?? name;
    add(displayName, "function", `${displayName}()`);
  }

  suggestions.sort((left, right) => {
    const kindOrder = { variable: 0, function: 1, constant: 2 };
    return kindOrder[left.kind] - kindOrder[right.kind] || left.name.localeCompare(right.name);
  });

  return { range, suggestions: suggestions.slice(0, 6) };
}

export function applyCompletion(value, range, suggestion) {
  const replacement = suggestion.insertion;
  const nextValue = `${value.slice(0, range.start)}${replacement}${value.slice(range.end)}`;
  const end = range.start + replacement.length;
  const cursor = suggestion.kind === "function" ? end - 1 : end;
  return { value: nextValue, cursor };
}
