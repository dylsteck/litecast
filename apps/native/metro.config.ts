/* eslint-disable */
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  /** @type {import('expo/metro-config').MetroConfig} */
  const config = getDefaultConfig(__dirname, {
    isCSSEnabled: true,
  });

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext: string) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
  };

  return config;
})();
