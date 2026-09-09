import { applyCompletion, findCompletions } from "./autocomplete.js";
import {
  BUILTIN_FUNCTIONS,
  CalculatorSyntaxError,
  completeParentheses,
  evaluateStatement,
  formatStatementResult,
} from "./calculator.js";
import {
  normalizeLocale,
  translate,
  translateCalculatorError,
} from "./i18n.js";

const expressionInput = document.querySelector("#expression");
const resultOutput = document.querySelector("#result");
const errorMessage = document.querySelector("#error-message");
const historyList = document.querySelector("#history");
const historyPanel = document.querySelector(".history-panel");
const emptyHistory = document.querySelector("#empty-history");
const clearHistoryButton = document.querySelector("#clear-history");
const announcement = document.querySelector("#announcement");
const historyTitle = document.querySelector("#history-title");
const expressionLabel = document.querySelector("#expression-label");
const calculateLabel = document.querySelector("#calculate-label");
const historyLabel = document.querySelector("#history-label");
const clearInputLabel = document.querySelector("#clear-input-label");
const settingsSummary = document.querySelector("#settings-summary");
const settings = document.querySelector("#settings");
const languageLabel = document.querySelector("#language-label");
const fontLabel = document.querySelector("#font-label");
const fontSizeLabel = document.querySelector("#font-size-label");
const angleModeLabel = document.querySelector("#angle-mode-label");
const languageSelect = document.querySelector("#language-select");
const fontSelect = document.querySelector("#font-select");
const fontSizeInput = document.querySelector("#font-size-input");
const angleModeSelect = document.querySelector("#angle-mode-select");
const fontMonoOption = document.querySelector("#font-mono-option");
const fontSansOption = document.querySelector("#font-sans-option");
const fontSerifOption = document.querySelector("#font-serif-option");
const radiansOption = document.querySelector("#radians-option");
const degreesOption = document.querySelector("#degrees-option");
const credits = document.querySelector("#credits");
const autocomplete = document.querySelector("#autocomplete");
const autocompleteList = document.querySelector("#autocomplete-list");
const autocompleteHelp = document.querySelector("#autocomplete-help");

const PREFERENCES_KEY = "webcrunch.preferences";
const FONT_OPTIONS = new Set(["mono", "sans", "serif"]);
const ANGLE_MODES = new Set(["rad", "deg"]);

function loadPreferences() {
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? "{}");
  } catch {
    stored = {};
  }

  const browserLocale = normalizeLocale(navigator.language);
  const font = FONT_OPTIONS.has(stored.font) ? stored.font : "mono";
  const storedFontSize = Number(stored.fontSize);
  const fontSize = [80, 100, 120, 140, 160].includes(storedFontSize)
    ? storedFontSize
    : 100;
  const angleMode = ANGLE_MODES.has(stored.angleMode) ? stored.angleMode : "rad";

  return {
    locale: normalizeLocale(stored.locale ?? browserLocale),
    font,
    fontSize,
    angleMode,
  };
}

const preferences = loadPreferences();
const state = {
  ans: null,
  variables: new Map(),
  functions: new Map(),
  builtins: BUILTIN_FUNCTIONS,
  history: [],
  historyIndex: 0,
  draft: "",
  locale: preferences.locale,
  font: preferences.font,
  fontSize: preferences.fontSize,
  angleMode: preferences.angleMode,
  autocompleteRange: null,
  autocompleteSuggestions: [],
};

function t(key, values) {
  return translate(state.locale, key, values);
}

function savePreferences() {
  try {
    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        locale: state.locale,
        font: state.font,
        fontSize: state.fontSize,
        angleMode: state.angleMode,
      }),
    );
  } catch {
    // Preferences are optional in restricted/private browser contexts.
  }
}

function applyAppearance() {
  document.documentElement.dataset.calculatorFont = state.font;
  document.documentElement.style.setProperty(
    "--calculator-size",
    `${1.5 * (state.fontSize / 100)}rem`,
  );
  fontSelect.value = state.font;
  fontSizeInput.value = String(state.fontSize);
  angleModeSelect.value = state.angleMode;
}

function applyTranslations() {
  document.documentElement.lang = state.locale;
  languageSelect.value = state.locale;
  historyTitle.textContent = t("calculationHistory");
  clearHistoryButton.textContent = t("clear");
  clearHistoryButton.title = t("clearTitle");
  emptyHistory.textContent = t("noCalculations");
  expressionLabel.textContent = t("expression");
  calculateLabel.textContent = t("calculate");
  historyLabel.textContent = t("history");
  clearInputLabel.textContent = t("clearInput");
  settingsSummary.textContent = t("settings");
  languageLabel.textContent = t("language");
  fontLabel.textContent = t("font");
  fontSizeLabel.textContent = t("fontSize");
  angleModeLabel.textContent = t("angleMode");
  fontMonoOption.textContent = t("fontMono");
  fontSansOption.textContent = t("fontSans");
  fontSerifOption.textContent = t("fontSerif");
  radiansOption.textContent = t("radians");
  degreesOption.textContent = t("degrees");
  credits.textContent = t("credits");
  autocompleteHelp.textContent = t("autocompleteHelp");
  renderHistory();
  renderAutocomplete();
}

function statementResult(statement) {
  return statement.kind === "function"
    ? t("saved")
    : formatStatementResult(statement);
}

function preview() {
  const expression = expressionInput.value.trim();
  errorMessage.textContent = "";
  expressionInput.removeAttribute("aria-invalid");

  if (!expression) {
    resultOutput.textContent = "";
    resultOutput.classList.remove("is-preview");
    updateAutocomplete();
    return;
  }

  try {
    const statement = evaluateStatement(expression, {
      ans: state.ans,
      variables: new Map(state.variables),
      functions: new Map(state.functions),
      angleMode: state.angleMode,
    });
    resultOutput.textContent = `= ${statementResult(statement)}`;
    resultOutput.classList.add("is-preview");
  } catch {
    resultOutput.textContent = "";
    resultOutput.classList.remove("is-preview");
  }

  updateAutocomplete();
}

function commit() {
  const expression = completeParentheses(expressionInput.value.trim());
  expressionInput.value = expression;

  try {
    const statement = evaluateStatement(expression, {
      ans: state.ans,
      variables: state.variables,
      functions: state.functions,
      angleMode: state.angleMode,
    });
    const result =
      statement.kind === "function" ? null : formatStatementResult(statement);

    if (statement.kind !== "function") state.ans = statement.value;
    state.history.push({ expression, result, kind: statement.kind });
    state.historyIndex = state.history.length;
    state.draft = "";

    expressionInput.value = "";
    errorMessage.textContent = "";
    expressionInput.removeAttribute("aria-invalid");
    resultOutput.textContent = "";
    resultOutput.classList.remove("is-preview");
    announcement.textContent =
      statement.kind === "function"
        ? `${expression}: ${t("saved")}`
        : `${expression} = ${result}`;
    hideAutocomplete();
    renderHistory();
  } catch (error) {
    showError(error);
  }
}

function showError(error) {
  const message =
    error instanceof CalculatorSyntaxError
      ? translateCalculatorError(state.locale, error)
      : t("unableToCalculate");

  errorMessage.textContent = message;
  expressionInput.setAttribute("aria-invalid", "true");
  announcement.textContent = message;
}

function browseHistory(direction) {
  if (state.history.length === 0) return;

  if (state.historyIndex === state.history.length) {
    state.draft = expressionInput.value;
  }

  state.historyIndex = Math.max(
    0,
    Math.min(state.history.length, state.historyIndex + direction),
  );

  expressionInput.value =
    state.historyIndex === state.history.length
      ? state.draft
      : state.history[state.historyIndex].expression;

  expressionInput.setSelectionRange(
    expressionInput.value.length,
    expressionInput.value.length,
  );
  preview();
}

function clearExpression() {
  expressionInput.value = "";
  state.historyIndex = state.history.length;
  state.draft = "";
  errorMessage.textContent = "";
  expressionInput.removeAttribute("aria-invalid");
  hideAutocomplete();
  preview();
}

function clearSession() {
  state.ans = null;
  state.variables.clear();
  state.functions.clear();
  state.history = [];
  state.historyIndex = 0;
  state.draft = "";
  expressionInput.value = "";
  resultOutput.textContent = "";
  resultOutput.classList.remove("is-preview");
  errorMessage.textContent = "";
  expressionInput.removeAttribute("aria-invalid");
  announcement.textContent = t("sessionCleared");
  hideAutocomplete();
  renderHistory();
  expressionInput.focus();
}

function reuseExpression(expression) {
  expressionInput.value = expression;
  state.historyIndex = state.history.length;
  expressionInput.focus();
  expressionInput.setSelectionRange(expression.length, expression.length);
  preview();
}

function renderHistory() {
  historyList.replaceChildren();
  emptyHistory.hidden = state.history.length > 0;

  state.history.forEach((entry) => {
    const item = document.createElement("li");
    const historyEntry = document.createElement("div");
    const content = document.createElement("div");
    const expression = document.createElement("span");
    const result = document.createElement("span");
    const reuseButton = document.createElement("button");

    historyEntry.className = "history-entry";
    content.className = "history-content";

    expression.className = "history-expression";
    expression.textContent = entry.expression;
    result.className = "history-result";
    result.textContent = entry.kind === "function" ? t("saved") : entry.result;
    result.dataset.kind = entry.kind;

    reuseButton.type = "button";
    reuseButton.className = "history-reuse";
    reuseButton.textContent = "↵";
    reuseButton.title = t("reuseExpression");
    reuseButton.setAttribute(
      "aria-label",
      `${t("reuseExpression")}: ${entry.expression}`,
    );
    reuseButton.addEventListener("click", () => reuseExpression(entry.expression));

    content.append(expression, result);
    historyEntry.append(content, reuseButton);
    item.append(historyEntry);
    historyList.append(item);
  });

  historyPanel.scrollTop = historyPanel.scrollHeight;
}

function updateAutocomplete() {
  const completion = findCompletions(
    expressionInput.value,
    expressionInput.selectionStart ?? expressionInput.value.length,
    state,
  );
  state.autocompleteRange = completion.range;
  state.autocompleteSuggestions = completion.suggestions;
  renderAutocomplete();
}

function renderAutocomplete() {
  autocompleteList.replaceChildren();

  if (!state.autocompleteRange || state.autocompleteSuggestions.length === 0) {
    hideAutocomplete();
    return;
  }

  state.autocompleteSuggestions.forEach((suggestion, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    const name = document.createElement("span");
    const kind = document.createElement("span");

    button.type = "button";
    button.className = "autocomplete-option";
    if (index === 0) button.classList.add("is-active");
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", index === 0 ? "true" : "false");
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => acceptCompletion(suggestion));

    name.textContent = suggestion.insertion;
    kind.className = "autocomplete-kind";
    kind.textContent = t(suggestion.kind);
    button.append(name, kind);
    item.append(button);
    autocompleteList.append(item);
  });

  autocomplete.hidden = false;
  expressionInput.setAttribute("aria-expanded", "true");
}

function hideAutocomplete() {
  autocomplete.hidden = true;
  expressionInput.setAttribute("aria-expanded", "false");
}

function acceptCompletion(suggestion = state.autocompleteSuggestions[0]) {
  if (!suggestion || !state.autocompleteRange) return;

  const completed = applyCompletion(
    expressionInput.value,
    state.autocompleteRange,
    suggestion,
  );
  expressionInput.value = completed.value;
  expressionInput.setSelectionRange(completed.cursor, completed.cursor);
  state.draft = completed.value;
  hideAutocomplete();
  expressionInput.focus();
  preview();
}

expressionInput.addEventListener("input", () => {
  state.historyIndex = state.history.length;
  state.draft = expressionInput.value;
  preview();
});

expressionInput.addEventListener("click", updateAutocomplete);
expressionInput.addEventListener("keyup", (event) => {
  if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    updateAutocomplete();
  }
});

expressionInput.addEventListener("keydown", (event) => {
  if (event.key === "Tab" && state.autocompleteSuggestions.length > 0) {
    event.preventDefault();
    acceptCompletion();
  } else if (event.key === "Enter") {
    event.preventDefault();
    commit();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    browseHistory(-1);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    browseHistory(1);
  } else if (event.key === "Escape" && !autocomplete.hidden) {
    event.preventDefault();
    hideAutocomplete();
  } else if (event.key === "Escape") {
    event.preventDefault();
    clearExpression();
  }
});

document.addEventListener("keydown", (event) => {
  if (
    (event.ctrlKey || event.metaKey) &&
    event.shiftKey &&
    event.key.toLowerCase() === "l"
  ) {
    event.preventDefault();
    clearSession();
    return;
  }

  const target = event.target;
  const isInteractiveTarget =
    target instanceof HTMLElement &&
    target.matches("button, input, select, summary, textarea, a, [contenteditable='true']");

  if (
    event.key === "Enter" &&
    document.activeElement !== expressionInput &&
    !isInteractiveTarget
  ) {
    event.preventDefault();
    settings.removeAttribute("open");
    expressionInput.focus();
  }
});

languageSelect.addEventListener("change", () => {
  state.locale = normalizeLocale(languageSelect.value);
  savePreferences();
  applyTranslations();
  preview();
});

fontSelect.addEventListener("change", () => {
  state.font = FONT_OPTIONS.has(fontSelect.value) ? fontSelect.value : "mono";
  savePreferences();
  applyAppearance();
  expressionInput.focus();
});

fontSizeInput.addEventListener("change", () => {
  state.fontSize = Number(fontSizeInput.value);
  savePreferences();
  applyAppearance();
});

angleModeSelect.addEventListener("change", () => {
  state.angleMode = ANGLE_MODES.has(angleModeSelect.value)
    ? angleModeSelect.value
    : "rad";
  savePreferences();
  preview();
  expressionInput.focus();
});

clearHistoryButton.addEventListener("click", clearSession);
applyAppearance();
applyTranslations();
preview();
