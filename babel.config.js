module.exports = function (api) {
  api.cache(true);
  const plugins = [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      blocklist: null,
      allowlist: null,
      safe: false,
      allowUndefined: true,
    }],

  ];

  if (process.env.NODE_ENV === 'production') {
    plugins.push('transform-remove-console');
  }
  plugins.push('react-native-reanimated/plugin');

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins,
  };
};
