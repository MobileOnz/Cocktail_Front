const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const defaultConfig = getDefaultConfig(__dirname);
const {
  resolver: { assetExts, sourceExts },
} = defaultConfig;

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),

    sourceExts: [...sourceExts, 'svg'],
    blockList: exclusionList([/Application Data\/.*/]),
  },
  watchFolders: [__dirname],
};

module.exports = mergeConfig(defaultConfig, config);
