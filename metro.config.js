const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const config = {
  resolver: {
    blacklistRE: exclusionList([
      /Application Data\/.*/,
    ]),
  },
  watchFolders: [
    // 현재 프로젝트 디렉토리만 watch하도록 제한
    __dirname,
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);