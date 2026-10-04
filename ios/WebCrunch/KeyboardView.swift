import SwiftUI

struct KeyboardView: View {
    @ObservedObject var model: CalculatorModel
    @State private var page = 0
    private var rows: [[String]] {
        switch page {
        case 1: return [["sin", "cos", "tan", "^"], ["arcsin", "arccos", "arctan", "π"], ["sqrt", "cbrt", "nthrt", "e"], ["log", "ln", "=", ";"], ["(", ")", "ans", "↵"]]
        case 2: return [["q", "w", "e", "r", "t", "y", "u"], ["i", "o", "p", "a", "s", "d", "f"], ["g", "h", "j", "k", "l", "z", "x"], ["c", "v", "b", "n", "m", "_", "="], ["(", ")", ",", ";", "space", "↵"]]
        default: return [["(", ")", "^", "÷"], ["7", "8", "9", "×"], ["4", "5", "6", "−"], ["1", "2", "3", "+"], ["0", ".", "ans", "↵"]]
        }
    }
    var body: some View {
        VStack(spacing: 6) {
            HStack(spacing: 4) {
                ForEach(0..<3) { index in
                    Button { page = index } label: {
                        Text(["123", "ƒ(x)", "ABC"][index])
                            .font(.system(.subheadline, design: .monospaced).weight(.semibold))
                            .frame(maxWidth: .infinity, minHeight: 44)
                            .foregroundStyle(page == index ? Theme.accent : Theme.muted)
                            .background(page == index ? Theme.input : .clear, in: RoundedRectangle(cornerRadius: 6))
                    }
                    .accessibilityLabel(model.t(["numbers", "functions", "letters"][index]))
                    .accessibilityAddTraits(page == index ? .isSelected : [])
                    .accessibilityIdentifier("keyboard-page-\(index)")
                }
                action("chevron.left", "left") { model.editor.move(-1) }
                action("chevron.right", "right") { model.editor.move(1) }
                action("delete.left", "delete") { model.editor.backspace() }
            }
            ForEach(Array(rows.enumerated()), id: \.offset) { _, row in
                HStack(spacing: 6) {
                    ForEach(row, id: \.self) { key in
                        Button { press(key) } label: {
                            Group {
                                if key == "↵" { Image(systemName: "return").font(.title3.weight(.semibold)) }
                                else if key == "space" { Image(systemName: "space") }
                                else { Text(key).font(.system(page == 2 ? .body : .title3, design: .monospaced).weight(.medium)).minimumScaleFactor(0.65).lineLimit(1) }
                            }
                            .frame(maxWidth: .infinity, minHeight: 46)
                            .foregroundStyle(key == "↵" ? Theme.background : isOperator(key) ? Theme.accent : Theme.text)
                            .background(key == "↵" ? Theme.accent : Theme.input, in: RoundedRectangle(cornerRadius: 7))
                            .contentShape(Rectangle())
                        }
                        .accessibilityLabel(key == "↵" ? model.t("calculate") : key == "space" ? model.t("space") : key)
                        .accessibilityIdentifier(key == "↵" ? "calculate" : "key-\(key)")
                    }
                }
            }
        }
        .buttonStyle(KeyStyle())
        .padding(.horizontal, 10).padding(.top, 4).padding(.bottom, 8)
        .background(Theme.background)
        .disabled(model.busy)
    }
    private func action(_ symbol: String, _ label: String, perform: @escaping () -> Void) -> some View {
        Button(action: perform) { Image(systemName: symbol).font(.body).frame(width: 44, height: 44).foregroundStyle(Theme.muted) }
            .accessibilityLabel(model.t(label)).accessibilityIdentifier(label)
    }
    private func isOperator(_ key: String) -> Bool { ["÷", "×", "−", "+", "^", "(", ")", "=", "π", "ans"].contains(key) }
    private func press(_ key: String) {
        if key == "↵" { model.commit(); return }
        if ["sin", "cos", "tan", "arcsin", "arccos", "arctan", "sqrt", "cbrt", "nthrt", "log", "ln"].contains(key) {
            model.editor.insert(key + "()")
            model.editor.move(-1)
        } else { model.editor.insert(key == "π" ? "pi" : key == "space" ? " " : key) }
    }
}

private struct KeyStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.opacity(configuration.isPressed ? 0.55 : 1)
    }
}
