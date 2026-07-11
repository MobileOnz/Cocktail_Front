/*
 * MockLocationDetector.kt  (T-22)
 *
 * ⚠️ 아직 Android 빌드에 등록되지 않았다. 등록 전까지 JS 는 false 로 폴백한다.
 *
 * 등록 방법:
 *   1. 이 파일을 android/app/src/main/java/com/cocktail_front/ 로 이동한다.
 *      (package 선언을 그 경로에 맞게 유지)
 *   2. MockLocationPackage 를 MainApplication 의 getPackages() 목록에 추가한다.
 *   3. AndroidManifest 에 ACCESS_FINE_LOCATION 이 이미 선언되어 있어야 한다(T-16에서 추가됨).
 *
 * 판정 근거:
 *   - API 31+ : Location.isMock
 *   - API 18~30 : Location.isFromMockProvider (deprecated)
 *   - 추가로 Settings.Secure.ALLOW_MOCK_LOCATION 은 API 23 부터 항상 "0" 을 반환하므로 쓰지 않는다.
 *     대신 "모의 위치 앱"으로 지정된 앱이 있는지는 AppOpsManager 로 본다.
 */
package com.cocktail_front

import android.annotation.SuppressLint
import android.app.AppOpsManager
import android.content.Context
import android.location.Location
import android.location.LocationManager
import android.os.Build
import android.os.Process
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class MockLocationDetector(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "MockLocationDetector"

    @Suppress("DEPRECATION")
    private fun Location.looksMocked(): Boolean =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) this.isMock else this.isFromMockProvider

    @SuppressLint("MissingPermission")
    @ReactMethod
    fun isMockLocation(promise: Promise) {
        try {
            val lm = reactApplicationContext
                .getSystemService(Context.LOCATION_SERVICE) as LocationManager

            // 마지막 위치가 없으면 판단 불가 → 의심 없음.
            val providers = listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER)
            val mocked = providers
                .mapNotNull { runCatching { lm.getLastKnownLocation(it) }.getOrNull() }
                .any { it.looksMocked() }

            promise.resolve(mocked)
        } catch (e: SecurityException) {
            // 위치 권한 없음 → 판단 불가. 서버가 어차피 좌표 없이는 인증을 안 준다.
            promise.resolve(false)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    /** 개발자 옵션에서 이 앱(또는 다른 앱)이 모의 위치 앱으로 지정되어 있는가. */
    @ReactMethod
    fun isMockLocationEnabledInSettings(promise: Promise) {
        try {
            val appOps = reactApplicationContext
                .getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager

            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_MOCK_LOCATION,
                    Process.myUid(),
                    reactApplicationContext.packageName,
                )
            } else {
                @Suppress("DEPRECATION")
                appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_MOCK_LOCATION,
                    Process.myUid(),
                    reactApplicationContext.packageName,
                )
            }
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }
}

/*
 * 함께 추가해야 하는 ReactPackage
 * ------------------------------------------------
 * package com.cocktail_front
 *
 * import com.facebook.react.ReactPackage
 * import com.facebook.react.bridge.NativeModule
 * import com.facebook.react.bridge.ReactApplicationContext
 * import com.facebook.react.uimanager.ViewManager
 *
 * class MockLocationPackage : ReactPackage {
 *     override fun createNativeModules(rc: ReactApplicationContext): List<NativeModule> =
 *         listOf(MockLocationDetector(rc))
 *     override fun createViewManagers(rc: ReactApplicationContext): List<ViewManager<*, *>> =
 *         emptyList()
 * }
 */
