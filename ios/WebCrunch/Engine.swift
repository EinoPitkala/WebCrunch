import Foundation
import JavaScriptCore

struct EngineReply: Decodable {
    let ok: Bool
    var expression: String?
    var result: String?
    var kind: String?
    var error: String?
    var snapshot: String?
}

// Owned by one serial queue; JSValue and JSContext never cross its boundary.
final class EngineCore {
    private let context: JSContext
    private let requestFunction: JSValue

    init(source: String) throws {
        guard let context = JSContext() else { throw EngineFailure.unavailable }
        context.evaluateScript(source)
        guard context.exception == nil,
              let function = context.objectForKeyedSubscript("WebCrunchBridge")?.objectForKeyedSubscript("request"),
              !function.isUndefined else { throw EngineFailure.unavailable }
        self.context = context
        self.requestFunction = function
    }

    func request(_ input: [String: String]) throws -> EngineReply {
        context.exception = nil
        guard let json = requestFunction.call(withArguments: [input])?.toString(),
              context.exception == nil, let data = json.data(using: .utf8) else { throw EngineFailure.unavailable }
        return try JSONDecoder().decode(EngineReply.self, from: data)
    }

    enum EngineFailure: Error { case unavailable }
}

final class CalculatorEngine: @unchecked Sendable {
    private let queue = DispatchQueue(label: "WebCrunch.calculator", qos: .userInitiated)
    private var core: EngineCore?

    func request(_ input: [String: String], completion: @escaping @Sendable (EngineReply?) -> Void) {
        queue.async { [self] in
            do {
                if core == nil {
                    guard let url = Bundle.main.url(forResource: "calculator", withExtension: "js") else {
                        throw EngineCore.EngineFailure.unavailable
                    }
                    core = try EngineCore(source: String(contentsOf: url, encoding: .utf8))
                }
                let reply = try core?.request(input)
                DispatchQueue.main.async { completion(reply) }
            } catch {
                DispatchQueue.main.async { completion(nil) }
            }
        }
    }
}
