import XCTest
@testable import WebCrunch

final class EngineTests: XCTestCase {
    private var engine: EngineCore!
    override func setUpWithError() throws {
        let bundle = Bundle(for: CalculatorModel.self)
        let url = try XCTUnwrap(bundle.url(forResource: "calculator", withExtension: "js"))
        engine = try EngineCore(source: String(contentsOf: url, encoding: .utf8))
    }
    private func calculate(_ source: String, action: String = "commit", angle: String = "rad") throws -> EngineReply {
        try engine.request(["action": action, "expression": source, "angle": angle, "locale": "fi"])
    }
    func testArithmeticAndPrecision() throws {
        XCTAssertEqual(try calculate("2(3+4)").result, "14")
        XCTAssertEqual(try calculate("0.1+0.2").result, "0.3")
        XCTAssertEqual(try calculate("100000000000000000000+1-100000000000000000000").result, "1")
        XCTAssertEqual(try calculate("sqrt(81").result, "9")
        XCTAssertEqual(try calculate("sin(30)", angle: "deg").result, "0.5")
    }
    func testLogarithmOptionalBase() throws {
        XCTAssertEqual(try calculate("log(1000)").result, "3")
        XCTAssertEqual(try calculate("log(8;2)").result, "3")
        XCTAssertEqual(try calculate("log(1;2)").result, "0")
        XCTAssertFalse(try calculate("log(8;1)").ok)
    }
    func testPreviewDoesNotMutateSession() throws {
        _ = try calculate("x=2")
        _ = try calculate("x=9", action: "preview")
        XCTAssertEqual(try calculate("x").result, "2")
        _ = try calculate("99", action: "preview")
        XCTAssertEqual(try calculate("ans").result, "2")
        _ = try calculate("f(x)=x+1", action: "preview")
        XCTAssertFalse(try calculate("f(2)").ok)
    }
    func testFunctionsAndSessionRestore() throws {
        _ = try calculate("a=2, b=3")
        _ = try calculate("f(x)=a*x+b")
        let saved = try calculate("f(4)")
        XCTAssertEqual(saved.result, "11")
        _ = try engine.request(["action": "clear"])
        XCTAssertFalse(try calculate("a").ok)
        _ = try engine.request(["action": "restore", "snapshot": XCTUnwrap(saved.snapshot)])
        XCTAssertEqual(try calculate("ans+f(4)").result, "22")
    }
    func testErrorsAndFailedAssignmentRemainAtomic() throws {
        _ = try calculate("a=2")
        XCTAssertFalse(try calculate("a=9,b=unknown").ok)
        XCTAssertEqual(try calculate("a").result, "2")
        XCTAssertFalse(try calculate("1/0").ok)
        XCTAssertFalse(try calculate("2+").ok)
        XCTAssertEqual(try calculate("2+3").result, "5")
    }
}
