import SwiftUI
import UIKit

struct HistoryEntry: Codable, Identifiable {
    var id = UUID()
    let expression: String
    let result: String
    let kind: String
}
private struct SavedSession: Codable {
    let history: [HistoryEntry]
    let snapshot: String
}

@MainActor
final class CalculatorModel: ObservableObject {
    @Published var expression = "" { didSet { schedulePreview() } }
    @Published var preview = ""
    @Published var error = ""
    @Published var history: [HistoryEntry] = []
    @Published var busy = true
    @Published private(set) var historyIndex: Int?
    private var historyDraft = ""
    @Published var locale: String { didSet { UserDefaults.standard.set(locale, forKey: "language"); schedulePreview() } }
    @Published var angle: String { didSet { UserDefaults.standard.set(angle, forKey: "angle"); schedulePreview() } }
    @Published var font: String { didSet { UserDefaults.standard.set(font, forKey: "font") } }
    @Published var scale: Double { didSet { UserDefaults.standard.set(scale, forKey: "scale") } }
    let editor = ExpressionEditor()
    private let engine = CalculatorEngine()
    private var revision = 0
    private var previewWork: DispatchWorkItem?
    private let sessionURL: URL
    private var snapshot = ""

    init() {
        let defaults = UserDefaults.standard
        let language = Locale.current.language.languageCode?.identifier ?? "en"
        locale = defaults.string(forKey: "language") ?? (["fi", "sv"].contains(language) ? language : "en")
        angle = defaults.string(forKey: "angle") ?? "rad"
        font = defaults.string(forKey: "font") ?? "mono"
        scale = defaults.object(forKey: "scale") as? Double ?? 1
        sessionURL = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent("WebCrunch/session.json")
        var restored: SavedSession?
        if FileManager.default.fileExists(atPath: sessionURL.path) {
            do { restored = try JSONDecoder().decode(SavedSession.self, from: Data(contentsOf: sessionURL)) }
            catch { self.error = Words.text("restoreError", locale) }
        }
        let saved = restored
        engine.request(saved.map { ["action": "restore", "snapshot": $0.snapshot] } ?? ["action": "clear"]) { [weak self] reply in
            MainActor.assumeIsolated {
                guard let self else { return }
                self.busy = false
                if reply?.ok == true, let saved {
                    self.history = saved.history
                    self.snapshot = saved.snapshot
                } else if reply?.ok != true { self.error = self.t(saved == nil ? "engineError" : "restoreError") }
            }
        }
    }
    func t(_ key: String) -> String { Words.text(key, locale) }
    var fontDesign: Font.Design { font == "sans" ? .default : font == "serif" ? .serif : .monospaced }

    var canBrowseOlder: Bool { !busy && !history.isEmpty && (historyIndex ?? history.count) > 0 }
    var canBrowseNewer: Bool { !busy && historyIndex != nil }
    var selectedHistoryID: UUID? { historyIndex.map { history[$0].id } }

    func browseHistory(older: Bool) {
        guard older ? canBrowseOlder : canBrowseNewer else { return }
        if historyIndex == nil { historyDraft = expression }
        let next = (historyIndex ?? history.count) + (older ? -1 : 1)
        historyIndex = next < history.count ? next : nil
        let text = historyIndex.map { history[$0].expression } ?? historyDraft
        expression = text
        editor.replaceAll(text)
    }

    private func resetHistoryBrowsing() {
        historyIndex = nil
        historyDraft = ""
    }

    private func schedulePreview() {
        revision += 1
        previewWork?.cancel()
        preview = ""
        error = ""
        guard !expression.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, !busy else { return }
        let ticket = revision
        let input = ["action": "preview", "expression": expression, "angle": angle, "locale": locale]
        let work = DispatchWorkItem { [weak self] in
            self?.engine.request(input) { [weak self] reply in
                MainActor.assumeIsolated {
                    guard let self, self.revision == ticket, !self.busy else { return }
                    if reply?.ok == true { self.preview = reply?.result ?? "" }
                }
            }
        }
        previewWork = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.12, execute: work)
    }

    func commit() {
        guard !busy, !expression.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        previewWork?.cancel()
        revision += 1
        busy = true
        error = ""
        engine.request(["action": "commit", "expression": expression, "angle": angle, "locale": locale]) { [weak self] reply in
            MainActor.assumeIsolated {
                guard let self else { return }
                self.busy = false
                guard let reply else { self.error = self.t("engineError"); return }
                guard reply.ok else {
                    self.error = reply.error ?? self.t("engineError")
                    UIAccessibility.post(notification: .announcement, argument: self.error)
                    return
                }
                self.resetHistoryBrowsing()
                self.history.append(HistoryEntry(expression: reply.expression ?? self.expression, result: reply.result ?? "", kind: reply.kind ?? "value"))
                self.snapshot = reply.snapshot ?? self.snapshot
                self.expression = ""
                self.editor.replaceAll("")
                self.persist()
                UIAccessibility.post(notification: .announcement, argument: reply.result)
            }
        }
    }
    func clearSession() {
        guard !busy else { return }
        busy = true
        previewWork?.cancel()
        revision += 1
        engine.request(["action": "clear"]) { [weak self] reply in
            MainActor.assumeIsolated {
                guard let self else { return }
                self.busy = false
                guard reply?.ok == true else { self.error = self.t("engineError"); return }
                self.resetHistoryBrowsing()
                self.history = []
                self.expression = ""
                self.editor.replaceAll("")
                self.snapshot = ""
                do {
                    if FileManager.default.fileExists(atPath: self.sessionURL.path) { try FileManager.default.removeItem(at: self.sessionURL) }
                } catch { self.error = self.t("saveError") }
            }
        }
    }
    func reuse(_ entry: HistoryEntry) {
        guard !busy else { return }
        if historyIndex == nil { historyDraft = expression }
        historyIndex = history.firstIndex { $0.id == entry.id }
        expression = entry.expression
        editor.replaceAll(entry.expression)
    }
    private func persist() {
        do {
            try FileManager.default.createDirectory(at: sessionURL.deletingLastPathComponent(), withIntermediateDirectories: true)
            try JSONEncoder().encode(SavedSession(history: history, snapshot: snapshot)).write(to: sessionURL, options: .atomic)
        } catch { self.error = t("saveError") }
    }
}
