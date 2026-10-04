import XCTest

final class KeyboardTests: XCTestCase {
    func testHistoryBrowsingRestoresDraftAndCanRecalculate() {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.buttons["key-8"].waitForExistence(timeout: 15))
        let ready = XCTNSPredicateExpectation(predicate: NSPredicate(format: "enabled == true"), object: app.textFields["expression"])
        XCTAssertEqual(XCTWaiter.wait(for: [ready], timeout: 15), .completed)
        if app.buttons["clear-input"].exists { app.buttons["clear-input"].tap() }
        for expression in ["812", "934"] {
            for digit in expression { app.buttons["key-\(digit)"].tap() }
            XCTAssertEqual(app.textFields["expression"].value as? String, expression)
            app.buttons["calculate"].tap()
            let committed = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == ''"), object: app.textFields["expression"])
            XCTAssertEqual(XCTWaiter.wait(for: [committed], timeout: 10), .completed)
        }
        app.buttons["key-7"].tap()
        app.buttons["history-older"].tap()
        XCTAssertEqual(app.textFields["expression"].value as? String, "934")
        app.buttons["history-older"].tap()
        XCTAssertEqual(app.textFields["expression"].value as? String, "812")
        app.buttons["history-newer"].tap()
        XCTAssertEqual(app.textFields["expression"].value as? String, "934")
        app.buttons["history-newer"].tap()
        XCTAssertEqual(app.textFields["expression"].value as? String, "7")
        XCTAssertFalse(app.buttons["history-newer"].isEnabled)
        app.buttons["history-older"].tap()
        app.buttons["key-+"].tap()
        app.buttons["key-1"].tap()
        app.buttons["calculate"].tap()
        XCTAssertTrue(app.staticTexts["935"].waitForExistence(timeout: 10))
        XCTAssertFalse(app.buttons["history-newer"].isEnabled)
    }

    func testCustomKeyboardCalculationAndCursorEditing() {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.buttons["key-2"].waitForExistence(timeout: 15))
        for key in ["2", "(", "3", "+", "4", ")"] { app.buttons["key-\(key)"].tap() }
        app.buttons["calculate"].tap()
        XCTAssertTrue(app.staticTexts["14"].waitForExistence(timeout: 10))
        app.buttons["key-1"].tap()
        app.buttons["key-3"].tap()
        app.buttons["left"].tap()
        app.buttons["key-2"].tap()
        XCTAssertEqual(app.textFields["expression"].value as? String, "123")
        app.buttons["delete"].tap()
        XCTAssertEqual(app.textFields["expression"].value as? String, "13")
        app.buttons["clear-input"].tap()
        app.buttons["keyboard-page-2"].tap()
        app.buttons["key-x"].tap()
        app.buttons["key-="].tap()
        app.buttons["keyboard-page-0"].tap()
        app.buttons["key-5"].tap()
        app.buttons["calculate"].tap()
        XCTAssertTrue(app.staticTexts["5"].waitForExistence(timeout: 10))
        app.terminate()
        app.launch()
        XCTAssertTrue(app.staticTexts["14"].waitForExistence(timeout: 15))
        app.buttons["keyboard-page-2"].tap()
        app.buttons["key-x"].tap()
        app.buttons["keyboard-page-0"].tap()
        app.buttons["key-×"].tap()
        app.buttons["key-2"].tap()
        app.buttons["calculate"].tap()
        XCTAssertTrue(app.staticTexts["10"].waitForExistence(timeout: 10))
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = "WebCrunch calculator"
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
