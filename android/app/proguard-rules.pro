# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

-keep public class com.navercorp.nid.** { *; }

-keepattributes Signature, EnclosingMethod, AnnotationDefault, InnerClasses
-keep class com.google.gson.** { *; }


-keep class com.kakao.sdk.**.model.** { <fields>; }
-keep class com.kakao.sdk.**.entity.** { *; }
-keep interface com.kakao.sdk.** { *; }
-dontwarn com.kakao.sdk.**
# Add any project specific keep options here:

-keep class com.navercorp.nid.** { *; }
-keep class com.nhn.android.naverlogin.** { *; }
-dontwarn com.navercorp.nid.**
-dontwarn com.nhn.android.naverlogin.**

# React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.core.** { *; }
-dontwarn com.facebook.react.turbomodule.core.**
# ── Retrofit / OkHttp (카카오 로그인이 내부적으로 씀) ─────────────────────────
#
# 증상: 카카오 로그인 누르면 앱이 죽었다(갤럭시 S20, 빌드 75).
#   IllegalArgumentException: Unable to create call adapter for interface ad.b
#                             for method AuthApi.issueAccessToken
#
# 'ad.b' 는 난독화된 retrofit2.Call 이다. AGP 8 부터 R8 full mode 가 기본인데,
# 이 모드는 **명시적으로 keep 하지 않은 클래스의 제네릭 시그니처를 지운다**.
# Retrofit 은 런타임에 메서드의 제네릭 반환 타입을 리플렉션으로 읽어 call adapter 를
# 고르므로, 시그니처가 지워지면 반환 타입을 못 읽고 위 예외로 죽는다.
# -keepattributes Signature 만으로는 부족하다 — keep 된 클래스에만 적용되기 때문이다.
#
# 아래는 Retrofit 이 공식 문서에서 R8 full mode 용으로 제시하는 규칙이다.
# 네이버·구글 로그인이 멀쩡했던 건 Retrofit 을 쓰지 않아서다.
-keep,allowobfuscation,allowshrinking interface retrofit2.Call
-keep,allowobfuscation,allowshrinking class retrofit2.Response
-keep,allowobfuscation,allowshrinking class kotlin.coroutines.Continuation

# Retrofit 인터페이스의 애노테이션 달린 메서드는 지우지 않는다.
-keepclassmembers,allowshrinking,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}

-keepattributes RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations
-dontwarn retrofit2.**
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
