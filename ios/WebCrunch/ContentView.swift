import SwiftUI

// Colors intentionally match src/styles.css in WebCrunch.
enum Theme {
    static let background = Color(hex: 0x21071b)
    static let panel = Color(hex: 0x2c0824)
    static let input = Color(hex: 0x340a2b)
    static let text = Color(hex: 0xf5edf3)
    static let muted = Color(hex: 0xa7899e)
    static let line = Color(hex: 0x542044)
    static let result = Color(hex: 0x67b8e8)
    static let accent = Color(hex: 0xc2b600)
    static let error = Color(hex: 0xff6c73)
}
private extension Color {
    init(hex: UInt32) { self.init(.sRGB, red: Double((hex >> 16) & 255) / 255, green: Double((hex >> 8) & 255) / 255, blue: Double(hex & 255) / 255, opacity: 1) }
}

struct ContentView: View {
    @StateObject private var model = CalculatorModel()
    @State private var settings = false
    @State private var confirmClear = false
    @ScaledMetric(relativeTo: .title2) private var textSize: CGFloat = 24

    var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                toolbar
                if geometry.size.width > 700 {
                    HStack(spacing: 0) {
                        history.frame(maxWidth: .infinity, maxHeight: .infinity)
                        Rectangle().fill(Theme.line).frame(width: 1)
                        ScrollView {
                            VStack(spacing: 0) { workbench; KeyboardView(model: model) }
                        }
                        .frame(width: min(430, geometry.size.width * 0.48))
                    }
                } else {
                    history.frame(maxWidth: .infinity, maxHeight: .infinity)
                    workbench
                    KeyboardView(model: model)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Theme.panel)
        }
        .background(Theme.background.ignoresSafeArea())
        .foregroundStyle(Theme.text)
        .tint(Theme.accent)
        .preferredColorScheme(.dark)
        .ignoresSafeArea(.keyboard)
        .sheet(isPresented: $settings) { SettingsView(model: model) }
        .confirmationDialog(model.t("clearTitle"), isPresented: $confirmClear, titleVisibility: .visible) {
            Button(model.t("clear"), role: .destructive) { model.clearSession() }
            Button(model.t("cancel"), role: .cancel) { }
        } message: { Text(model.t("clearBody")) }
    }

    private var toolbar: some View {
        HStack(spacing: 10) {
            Text("WebCrunch").font(.system(.headline, design: .monospaced)).foregroundStyle(Theme.text)
            Spacer()
            Text(model.angle.uppercased()).font(.system(.caption, design: .monospaced)).foregroundStyle(Theme.muted)
            Button { confirmClear = true } label: { Image(systemName: "trash").frame(width: 44, height: 44) }
                .accessibilityLabel(model.t("clear")).disabled(model.busy || model.history.isEmpty)
            Button { settings = true } label: { Image(systemName: "slider.horizontal.3").frame(width: 44, height: 44) }
                .accessibilityLabel(model.t("settings")).accessibilityIdentifier("settings")
        }
        .foregroundStyle(Theme.muted).padding(.leading, 20).padding(.trailing, 8)
    }
    private var history: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 25) {
                    ForEach(model.history) { entry in
                        HStack(alignment: .top, spacing: 8) {
                            VStack(alignment: .leading, spacing: 6) {
                                Text(entry.expression).foregroundStyle(Theme.text)
                                HStack(alignment: .firstTextBaseline, spacing: 10) {
                                    Text("=").foregroundStyle(Theme.accent)
                                    Text(entry.kind == "function" ? model.t("saved") : entry.result)
                                        .foregroundStyle(Theme.result).accessibilityIdentifier("history-result")
                                }
                            }
                            .font(.system(size: textSize * model.scale, design: model.fontDesign))
                            .textSelection(.enabled)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            Button { model.reuse(entry) } label: { Image(systemName: "arrow.uturn.down").frame(width: 44, height: 44).foregroundStyle(Theme.muted) }
                                .accessibilityLabel(model.t("reuse")).disabled(model.busy)
                        }
                        .contextMenu {
                            Button(model.t("copy"), systemImage: "doc.on.doc") { UIPasteboard.general.string = entry.result }
                            Button(model.t("reuse"), systemImage: "arrow.uturn.down") { model.reuse(entry) }
                        }
                        .id(entry.id)
                    }
                    Color.clear.frame(height: 1).id("bottom")
                }
                .padding(20)
            }
            .overlay {
                if model.history.isEmpty {
                    VStack(spacing: 10) {
                        Text(model.t("empty")).font(.system(.body, design: .monospaced))
                        Text(model.t("hint")).font(.footnote)
                    }
                    .foregroundStyle(Theme.muted).multilineTextAlignment(.center).padding(20)
                }
            }
            .onChange(of: model.history.count) { _, _ in proxy.scrollTo("bottom", anchor: .bottom) }
            .onChange(of: model.selectedHistoryID) { _, id in
                if let id { proxy.scrollTo(id, anchor: .center) }
                else { proxy.scrollTo("bottom", anchor: .bottom) }
            }
        }
    }
    private func historyButton(_ symbol: String, label: String, enabled: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: symbol).font(.body.weight(.medium))
                .frame(width: 44, height: 44)
                .foregroundStyle(enabled ? Theme.accent : Theme.muted.opacity(0.4))
        }
        .disabled(!enabled)
        .accessibilityLabel(model.t(label))
        .accessibilityIdentifier("history-" + label)
    }

    private var workbench: some View {
        VStack(alignment: .leading, spacing: 6) {
            if !model.preview.isEmpty {
                Text("= " + model.preview)
                    .font(.system(size: textSize * model.scale, design: model.fontDesign))
                    .foregroundStyle(Theme.result).textSelection(.enabled)
                    .accessibilityIdentifier("preview")
            }
            if !model.error.isEmpty {
                Text(model.error).font(.footnote).foregroundStyle(Theme.error).accessibilityIdentifier("error")
            }
            HStack(spacing: 10) {
                Image(systemName: "chevron.right").foregroundStyle(Theme.accent).accessibilityHidden(true)
                ExpressionField(text: $model.expression, editor: model.editor, label: model.t("expression"), size: textSize * model.scale, design: model.font, enabled: !model.busy, commit: model.commit)
                    .frame(height: max(44, textSize * model.scale * 1.5))
                if model.busy { ProgressView().tint(Theme.accent).frame(width: 44) }
                else if !model.expression.isEmpty {
                    Button { model.expression = ""; model.editor.replaceAll("") } label: { Image(systemName: "xmark.circle.fill").foregroundStyle(Theme.muted).frame(width: 44, height: 44) }
                        .accessibilityLabel(model.t("clearInput")).accessibilityIdentifier("clear-input")
                }
                HStack(spacing: 0) {
                    historyButton("arrow.up", label: "older", enabled: model.canBrowseOlder) { model.browseHistory(older: true) }
                    historyButton("arrow.down", label: "newer", enabled: model.canBrowseNewer) { model.browseHistory(older: false) }
                }
            }
        }
        .padding(.horizontal, 18).padding(.vertical, 12)
        .background(Theme.input)
        .overlay(alignment: .top) { Rectangle().fill(Theme.line).frame(height: 1) }
    }
}

struct SettingsView: View {
    @ObservedObject var model: CalculatorModel
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Picker(model.t("language"), selection: $model.locale) {
                        Text("Suomi").tag("fi"); Text("English").tag("en"); Text("Svenska").tag("sv")
                    }
                    Picker(model.t("angle"), selection: $model.angle) {
                        Text(model.t("radians")).tag("rad"); Text(model.t("degrees")).tag("deg")
                    }
                }
                Section {
                    Picker(model.t("font"), selection: $model.font) {
                        Text(model.t("mono")).tag("mono"); Text(model.t("sans")).tag("sans"); Text(model.t("serif")).tag("serif")
                    }
                    Picker(model.t("size"), selection: $model.scale) {
                        ForEach([0.8, 1.0, 1.2, 1.4, 1.6], id: \.self) { value in Text("\(Int(value * 100))%").tag(value) }
                    }
                }
                Section {
                    Text(model.t("privacy")).foregroundStyle(.secondary)
                    NavigationLink(model.t("licenses")) { LicensesView() }
                }
            }
            .navigationTitle(model.t("settings"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button(model.t("done")) { dismiss() } } }
        }
        .tint(Theme.accent)
    }
}

private struct LicensesView: View {
    var body: some View {
        List {
            ForEach(["WebCrunch-LICENSE", "Abicus-LICENSE", "decimal.js-MIT", "neverthrow-MIT", "ts-pattern-MIT"], id: \.self) { name in
                NavigationLink(name) {
                    ScrollView {
                        Text(contents(name)).font(.footnote.monospaced()).textSelection(.enabled).padding()
                    }.navigationTitle(name).navigationBarTitleDisplayMode(.inline)
                }
            }
        }
    }
    private func contents(_ name: String) -> String {
        guard let url = Bundle.main.url(forResource: name, withExtension: "txt"), let value = try? String(contentsOf: url, encoding: .utf8) else { return name }
        return value
    }
}
