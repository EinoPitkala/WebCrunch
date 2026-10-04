# WebCrunch for iOS

Native SwiftUI app using WebCrunch's existing calculator through JavaScriptCore.
The bundled engine runs offline; no web view, server, or downloaded code is needed.
Requires Xcode with the iOS SDK. Deployment target: iOS/iPadOS 17 or newer.

## Run

Open `WebCrunch.xcodeproj`, select the **WebCrunch** scheme and an iPhone simulator,
then press **Command-R**. No npm command is needed to run the checked-in app.
For a physical device, choose your development team in Signing & Capabilities.
No developer team or signing credentials are committed.

## Included

- WebCrunch's existing colors and calculator layout in SwiftUI.
- Custom number, function, and letter keyboards; cursor movement and deletion.
- Live preview, variables, user functions, and degree/radian modes.
- Selectable history and expression reuse. Input-row up/down buttons browse
  earlier expressions and restore the draft when returning past the newest entry.
- History and full-precision calculator state saved locally between launches.
- Finnish, English, and Swedish interface; font and text-size preferences.
- `log(value)` defaults to base 10; `log(value; base)` takes an optional base.
- Adaptive iPhone/iPad layout and bundled license notices.

## Maintain

From the repository root, after changing the shared calculator or iOS bridge:

```sh
npm ci
npm run check
node ios/scripts/build-engine.mjs
```

Commit the regenerated `ios/WebCrunch/Resources/calculator.js`. The Xcode build
uses this checked-in bundle and does not require Node or network access.

The project is checked in. If adding source/resource files, regenerate it with:

```sh
python3 ios/scripts/generate-project.py
```

The generator owns the project and shared scheme; update it when changing their
configuration. Local Xcode user state and build products are ignored.

## Verification

Run tests through **Product > Test** in Xcode, or:

```sh
xcodebuild -project ios/WebCrunch.xcodeproj -scheme WebCrunch \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  CODE_SIGNING_ALLOWED=NO test
```

Verified during development: simulator build, five native engine tests, the
history browsing/draft restoration UI test, and all 188 existing web tests.
The broader custom-keyboard UI test is included but has not been verified.
Physical-device, iPad, landscape, large-text, and VoiceOver coverage remain open.
Autocomplete, hardware up/down shortcuts, and native LaTeX paste are not yet
implemented. This is an initial app, not an App Store submission package.

The shared two-argument logarithm convention changed from `log(base; value)` to
`log(value; base)`. Existing saved formulas using the former order need updating.
Legacy `log_2 8` parsing remains for compatibility, but has no custom keyboard key.
