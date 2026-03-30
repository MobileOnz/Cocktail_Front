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