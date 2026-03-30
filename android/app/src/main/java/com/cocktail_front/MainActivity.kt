package com.cocktail_front

import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Base64
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.devio.rn.splashscreen.SplashScreen
import java.security.MessageDigest

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
      SplashScreen.show(this, true)
      super.onCreate(savedInstanceState)
      logKeyHash()
  }

  private fun logKeyHash() {
      try {
          val info = packageManager.getPackageInfo(packageName, PackageManager.GET_SIGNATURES)
          for (signature in info.signatures ?: emptyArray()) {
              val md = MessageDigest.getInstance("SHA")
              md.update(signature.toByteArray())
              val keyHash = Base64.encodeToString(md.digest(), Base64.NO_WRAP)
              Log.d("KakaoKeyHash", "KeyHash: $keyHash")
          }
      } catch (e: Exception) {
          Log.e("KakaoKeyHash", "KeyHash 추출 실패: ${e.message}")
      }
  }

  override fun getMainComponentName(): String = "Cocktail_Front"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
