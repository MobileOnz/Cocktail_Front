cmake_minimum_required(VERSION 3.13)

project(appmodules)

# 16KB 메모리 페이지 크기 지원 (Android 15+ / NDK r27+)
# -DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON 과 함께 사용
add_link_options(-Wl,-z,max-page-size=16384)

# React Native application cmake 설정 포함
# REACT_ANDROID_DIR 은 RN gradle plugin 이 자동으로 주입한다
include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)
