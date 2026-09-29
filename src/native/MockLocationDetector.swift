//
//  MockLocationDetector.swift  (T-22)
//
//  ⚠️ 아직 Xcode 프로젝트에 추가되지 않았다. 등록 전까지 JS 는 false 로 폴백한다.
//
//  등록 방법:
//    1. 이 파일을 ios/Cocktail_Front/ 로 이동하고 Xcode 타깃에 추가한다.
//    2. 같은 폴더의 브릿징 헤더(Cocktail_Front-Bridging-Header.h)에
//       #import <React/RCTBridgeModule.h> 가 있는지 확인한다.
//       (이 레포에는 이미 SwiftBridge.swift 가 있으므로 브릿징 헤더가 구성되어 있다.)
//    3. 아래 MockLocationDetector.m (Objective-C 익스포트)도 함께 추가한다.
//
//  판정 근거:
//    iOS 15+ 는 CLLocation.sourceInformation 을 제공한다.
//      - isSimulatedBySoftware: Xcode/시뮬레이터/위치 스푸핑 앱
//      - isProducedByAccessory: 외부 액세서리(정상일 수 있으나 매장 인증에선 보수적으로 의심)
//    iOS 14 이하는 판정 수단이 없다 → false(의심 없음). 서버의 QR·반경 게이트가 막는다.
//

import Foundation
import CoreLocation

@objc(MockLocationDetector)
class MockLocationDetector: NSObject {

  private let locationManager = CLLocationManager()

  @objc
  static func requiresMainQueueSetup() -> Bool { return false }

  /// 마지막으로 알려진 위치의 sourceInformation 을 검사한다.
  @objc(isMockLocation:withRejecter:)
  func isMockLocation(resolve: @escaping RCTPromiseResolveBlock,
                      reject: @escaping RCTPromiseRejectBlock) {
    guard let location = locationManager.location else {
      // 위치가 아직 없으면 판단 불가 → 의심 없음으로 처리한다.
      resolve(false)
      return
    }

    if #available(iOS 15.0, *) {
      guard let info = location.sourceInformation else {
        resolve(false)
        return
      }
      resolve(info.isSimulatedBySoftware || info.isProducedByAccessory)
    } else {
      // iOS 14 이하: 탐지 불가.
      resolve(false)
    }
  }

  /// Android 전용 개념. iOS 에서는 항상 false.
  @objc(isMockLocationEnabledInSettings:withRejecter:)
  func isMockLocationEnabledInSettings(resolve: @escaping RCTPromiseResolveBlock,
                                       reject: @escaping RCTPromiseRejectBlock) {
    resolve(false)
  }
}

//
//  함께 추가해야 하는 MockLocationDetector.m
//  ------------------------------------------------
//  #import <React/RCTBridgeModule.h>
//
//  @interface RCT_EXTERN_MODULE(MockLocationDetector, NSObject)
//
//  RCT_EXTERN_METHOD(isMockLocation:(RCTPromiseResolveBlock)resolve
//                    withRejecter:(RCTPromiseRejectBlock)reject)
//
//  RCT_EXTERN_METHOD(isMockLocationEnabledInSettings:(RCTPromiseResolveBlock)resolve
//                    withRejecter:(RCTPromiseRejectBlock)reject)
//
//  @end
//
