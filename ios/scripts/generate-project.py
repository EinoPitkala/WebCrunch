"""Generate the dependency-free Xcode project. Run from any directory."""
from pathlib import Path
import hashlib
root = Path(__file__).resolve().parents[1]
objects = {}
def ident(name): return hashlib.sha1(name.encode()).hexdigest()[:24].upper()
def add(name, text):
    objects[ident(name)] = text
    return ident(name)
def refs(items): return '(' + ', '.join(items) + ',)'
def group(name, children, path=None):
    return add(name, 'isa = PBXGroup; children = ' + refs(children) + '; ' + (f'path = "{path}"; ' if path else '') + 'sourceTree = "<group>";')
def file(path, kind):
    return add('file:'+path, f'isa = PBXFileReference; lastKnownFileType = {kind}; path = "{path}"; sourceTree = "<group>";')
def buildfile(path, ref): return add('build:'+path, f'isa = PBXBuildFile; fileRef = {ref};')
def phase(name, kind, files): return add(name, f'isa = PBX{kind}BuildPhase; buildActionMask = 2147483647; files = {refs(files) if files else "()"}; runOnlyForDeploymentPostprocessing = 0;')
appfiles=[]; sources=[]; resources=[]; resourcefiles=[]
for p in sorted((root/'WebCrunch').glob('*.swift')):
    ref=file(p.name, 'sourcecode.swift'); appfiles.append(ref); sources.append(buildfile(p.name,ref))
for p in sorted((root/'WebCrunch/Resources').glob('*')):
    ref=file(p.name, 'sourcecode.javascript' if p.suffix == '.js' else 'text'); resourcefiles.append(ref); resources.append(buildfile(p.name,ref))
assets=file('Assets.xcassets','folder.assetcatalog'); appfiles.append(assets); resources.append(buildfile('assets',assets))
appfiles.append(group('resources',resourcefiles,'Resources'))
appgroup=group('app',appfiles,'WebCrunch')
testRefs=[]; testSources=[]
for p in ['EngineTests.swift','KeyboardTests.swift']:
    ref=file(p,'sourcecode.swift'); testRefs.append(ref); testSources.append(buildfile(p,ref))
testgroup=group('tests',testRefs,'WebCrunchTests')
products=[]; targets=[]
for name, product, kind, code in [('WebCrunch','WebCrunch.app','com.apple.product-type.application',sources),('WebCrunchTests','WebCrunchTests.xctest','com.apple.product-type.bundle.unit-test',[testSources[0]]),('WebCrunchUITests','WebCrunchUITests.xctest','com.apple.product-type.bundle.ui-testing',[testSources[1]])]:
    productref=add('product:'+name, f'isa = PBXFileReference; explicitFileType = {"wrapper.application" if name == "WebCrunch" else "wrapper.cfbundle"}; path = {product}; sourceTree = BUILT_PRODUCTS_DIR;')
    products.append(productref)
    phases=[phase(name+'sources','Sources',code),phase(name+'frameworks','Frameworks',[]),phase(name+'resources','Resources',resources if name == 'WebCrunch' else [])]
    configurations=[]
    for config in ['Debug','Release']:
        settings={'PRODUCT_NAME':'"$(TARGET_NAME)"','PRODUCT_BUNDLE_IDENTIFIER':f'"fi.webcrunch.{name.lower()}"','SWIFT_VERSION':'5.0','SUPPORTED_PLATFORMS':'"iphoneos iphonesimulator"','SUPPORTS_MACCATALYST':'NO','IPHONEOS_DEPLOYMENT_TARGET':'17.0','TARGETED_DEVICE_FAMILY':'"1,2"','GENERATE_INFOPLIST_FILE':'YES','CODE_SIGN_STYLE':'Automatic','MARKETING_VERSION':'0.1.0','CURRENT_PROJECT_VERSION':'1','SWIFT_EMIT_LOC_STRINGS':'NO'}
        if name=='WebCrunch':
            settings.update({'INFOPLIST_KEY_UILaunchScreen_Generation':'YES','INFOPLIST_KEY_UIApplicationSceneManifest_Generation':'YES','INFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents':'YES','INFOPLIST_KEY_UISupportedInterfaceOrientations':'"UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight"','INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad':'"UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight"','INFOPLIST_KEY_CFBundleDisplayName':'WebCrunch','ASSETCATALOG_COMPILER_APPICON_NAME':'AppIcon','ENABLE_USER_SCRIPT_SANDBOXING':'YES'})
        elif name=='WebCrunchTests': settings.update({'TEST_HOST':'"$(BUILT_PRODUCTS_DIR)/WebCrunch.app/$(BUNDLE_EXECUTABLE_FOLDER_PATH)/WebCrunch"','BUNDLE_LOADER':'"$(TEST_HOST)"'})
        else: settings['TEST_TARGET_NAME']='WebCrunch'
        configurations.append(add(name+config,'isa = XCBuildConfiguration; name = '+config+'; buildSettings = { '+' '.join(k+' = '+v+';' for k,v in settings.items())+' };'))
    cfg=add(name+'configs','isa = XCConfigurationList; buildConfigurations = '+refs(configurations)+'; defaultConfigurationIsVisible = 0; defaultConfigurationName = Release;')
    deps=[]
    if name!='WebCrunch':
        proxy=add(name+'proxy',f'isa = PBXContainerItemProxy; containerPortal = {ident("project")}; proxyType = 1; remoteGlobalIDString = {ident("target:WebCrunch")}; remoteInfo = WebCrunch;')
        deps=[add(name+'dependency',f'isa = PBXTargetDependency; target = {ident("target:WebCrunch")}; targetProxy = {proxy};')]
    targets.append(add('target:'+name,f'isa = PBXNativeTarget; buildConfigurationList = {cfg}; buildPhases = {refs(phases)}; buildRules = (); dependencies = {refs(deps) if deps else "()"}; name = {name}; productName = {name}; productReference = {productref}; productType = "{kind}";'))
productsGroup=group('products',products)
main=group('main',[appgroup,testgroup,productsGroup])
configs=[]
for name in ['Debug','Release']:
    configs.append(add('project'+name, 'isa = XCBuildConfiguration; name = '+name+'; buildSettings = { SDKROOT = iphoneos; CLANG_ENABLE_MODULES = YES; SWIFT_OPTIMIZATION_LEVEL = '+('"-Onone"' if name=='Debug' else '"-O"')+'; DEBUG_INFORMATION_FORMAT = dwarf; ENABLE_TESTABILITY = YES; };'))
cfg=add('projectconfig','isa = XCConfigurationList; buildConfigurations = '+refs(configs)+'; defaultConfigurationIsVisible = 0; defaultConfigurationName = Release;')
add('project',f'isa = PBXProject; attributes = {{ LastUpgradeCheck = 2600; }}; buildConfigurationList = {cfg}; compatibilityVersion = "Xcode 14.0"; developmentRegion = en; knownRegions = (en, fi, sv, Base); mainGroup = {main}; productRefGroup = {productsGroup}; projectDirPath = ""; projectRoot = ""; targets = {refs(targets)};')
(root/'WebCrunch.xcodeproj/project.pbxproj').write_text('// !$*UTF8*$!\n{ archiveVersion = 1; classes = {}; objectVersion = 56; objects = {\n'+'\n'.join(key+' = { '+value+' };' for key,value in objects.items())+'\n}; rootObject = '+ident('project')+'; }\n')
def reference(name, product): return f'<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{ident("target:"+name)}" BuildableName="{product}" BlueprintName="{name}" ReferencedContainer="container:WebCrunch.xcodeproj"/>'
app=reference('WebCrunch','WebCrunch.app')
(root/'WebCrunch.xcodeproj/xcshareddata/xcschemes/WebCrunch.xcscheme').write_text(f'''<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="2600" version="1.3">
<BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries><BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES">{app}</BuildActionEntry></BuildActionEntries></BuildAction>
<TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES"><Testables><TestableReference skipped="NO">{reference('WebCrunchTests','WebCrunchTests.xctest')}</TestableReference><TestableReference skipped="NO">{reference('WebCrunchUITests','WebCrunchUITests.xctest')}</TestableReference></Testables></TestAction>
<LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" debugServiceExtension="internal" allowLocationSimulation="YES"><BuildableProductRunnable runnableDebuggingMode="0">{app}</BuildableProductRunnable></LaunchAction>
<ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugDocumentVersioning="YES"><BuildableProductRunnable runnableDebuggingMode="0">{app}</BuildableProductRunnable></ProfileAction>
<AnalyzeAction buildConfiguration="Debug"/><ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/>
</Scheme>''')
