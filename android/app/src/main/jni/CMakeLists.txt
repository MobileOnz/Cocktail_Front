cmake_minimum_required(VERSION 3.13)

project(cocktail_front)

# 16KB 메모리 페이지 크기 지원 (Android 15+)
# NDK r27+ 필수
add_link_options(-Wl,-z,max-page-size=16384)

# React Native application cmake 유틸리티 포함
include(${REACT_ANDROID_BUILD_DIR}/cmake-utils/ReactNative-application.cmake)
