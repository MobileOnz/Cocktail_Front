import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import GoogleMaps
import FirebaseCore
import NaverThirdPartyLogin // ✅ 네이버 SDK import
import GoogleSignIn 
import KakaoSDKAuth
import RNBootSplash

@main
class AppDelegate: RCTAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil
  ) -> Bool {
    self.moduleName = "Cocktail_Front"
    self.dependencyProvider = RCTAppDependencyProvider()

    GMSServices.provideAPIKey("AIzaSyDeVQ2wHr3QIavBa4RGYwZly8h0sNTfLmQ")
    self.initialProps = [:]
    FirebaseApp.configure()

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

override func application(
  _ application: UIApplication,
  open url: URL,
  options: [UIApplication.OpenURLOptionsKey : Any] = [:]
) -> Bool {
  // ✅ 네이버 로그인 처리
  if url.scheme == "naverlogin" {
    return NaverThirdPartyLoginConnection
      .getSharedInstance()?
      .application(application, open: url, options: options) ?? false
  }

  // ✅ 카카오 로그인 처리
  if AuthApi.isKakaoTalkLoginUrl(url) {
    return AuthController.handleOpenUrl(url: url)
  }

  // ✅ 구글 로그인 처리
  if GIDSignIn.sharedInstance.handle(url) {
    return true
  }

  // ✅ 기타 기본 처리 (super)
  return super.application(application, open: url, options: options)
}


  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
    return  Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
  override func customize(_ rootView: RCTRootView!) {
    super.customize(rootView)
    RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView) // ⬅️ initialize the splash screen
  }
}
