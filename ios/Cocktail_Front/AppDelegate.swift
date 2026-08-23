import UIKit
import React
import React_RCTAppDelegate
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

  // 나머지는 React Native 로 넘긴다.
  //
  // 예전엔 여기서 super 를 불렀는데, RCTAppDelegate 에는 application(_:open:options:) 가
  // 없다. 없는 셀렉터를 super 로 부르니 doesNotRecognizeSelector → SIGABRT 로 앱이 죽었다.
  // 그래서 소셜 로그인이 아닌 모든 딥링크(onzcocktail://, QR 커스텀 스킴)가 크래시했다.
  return RCTLinkingManager.application(application, open: url, options: options)
}

// 유니버설 링크(https://onz-cocktail.kr/...)도 같은 경로로 넘긴다.
override func application(
  _ application: UIApplication,
  continue userActivity: NSUserActivity,
  restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
) -> Bool {
  return RCTLinkingManager.application(
    application, continue: userActivity, restorationHandler: restorationHandler)
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
