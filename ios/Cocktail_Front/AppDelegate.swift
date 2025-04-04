import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import GoogleMaps
import FirebaseCore
import NaverThirdPartyLogin // ✅ 네이버 SDK import
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

  // ✅ 네이버 & 카카오 로그인 콜백 처리용 메서드
  override func application(
    _ application: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
  ) -> Bool {
    // 네이버
    if url.scheme == "naverlogin" {
      return NaverThirdPartyLoginConnection
        .getSharedInstance()?
        .application(application, open: url, options: options) ?? false
    }

    // 카카오
    // if RNKakaoLogins.isKakaoTalkLoginUrl(url) {
    //   return RNKakaoLogins.handleOpenUrl(url)
    // }

    return super.application(application, open: url, options: options)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}
