import SwiftUI
import UIKit

@MainActor
final class ExpressionEditor {
    weak var field: UITextField?
    func insert(_ text: String) {
        guard let field else { return }
        field.becomeFirstResponder()
        field.insertText(text)
        field.sendActions(for: .editingChanged)
    }
    func backspace() {
        field?.deleteBackward()
        field?.sendActions(for: .editingChanged)
    }
    func move(_ offset: Int) {
        guard let field, let range = field.selectedTextRange,
              let next = field.position(from: offset < 0 ? range.start : range.end, offset: offset) else { return }
        field.selectedTextRange = field.textRange(from: next, to: next)
    }
    func replaceAll(_ text: String) {
        guard let field else { return }
        field.text = text
        field.selectedTextRange = field.textRange(from: field.endOfDocument, to: field.endOfDocument)
        field.sendActions(for: .editingChanged)
        field.becomeFirstResponder()
    }
}

struct ExpressionField: UIViewRepresentable {
    @Binding var text: String
    let editor: ExpressionEditor
    let label: String
    let size: CGFloat
    let design: String
    let enabled: Bool
    let commit: () -> Void

    func makeUIView(context: Context) -> UITextField {
        let field = UITextField()
        field.delegate = context.coordinator
        field.addTarget(context.coordinator, action: #selector(Coordinator.changed(_:)), for: .editingChanged)
        field.autocorrectionType = .no
        field.autocapitalizationType = .none
        field.spellCheckingType = .no
        field.smartQuotesType = .no
        field.smartDashesType = .no
        field.inputView = UIView(frame: .zero)
        field.inputAssistantItem.leadingBarButtonGroups = []
        field.inputAssistantItem.trailingBarButtonGroups = []
        field.textColor = UIColor(Theme.text)
        field.tintColor = UIColor(Theme.accent)
        field.accessibilityIdentifier = "expression"
        field.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        editor.field = field
        DispatchQueue.main.async { field.becomeFirstResponder() }
        return field
    }
    func updateUIView(_ field: UITextField, context: Context) {
        context.coordinator.parent = self
        if field.text != text { field.text = text }
        let base = UIFont.systemFont(ofSize: size)
        let uiDesign: UIFontDescriptor.SystemDesign = design == "mono" ? .monospaced : design == "serif" ? .serif : .default
        field.font = UIFont(descriptor: base.fontDescriptor.withDesign(uiDesign) ?? base.fontDescriptor, size: size)
        field.accessibilityLabel = label
        field.isEnabled = enabled
    }
    func makeCoordinator() -> Coordinator { Coordinator(self) }
    final class Coordinator: NSObject, UITextFieldDelegate {
        var parent: ExpressionField
        init(_ parent: ExpressionField) { self.parent = parent }
        @objc func changed(_ field: UITextField) { parent.text = field.text ?? "" }
        func textFieldShouldReturn(_ textField: UITextField) -> Bool { parent.commit(); return false }
        func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
            if string.contains("\n") { parent.commit(); return false }
            return ((textField.text ?? "") as NSString).length - range.length + (string as NSString).length <= 4000
        }
    }
}
