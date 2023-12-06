// eslint-disable-next-line turbo/no-undeclared-env-vars
process.env.TAMAGUI_TARGET = 'native';

module.exports = function (api) {
  api.cache(true);
  return {
    plugins: [
      'expo-router/babel',
      [
        'transform-inline-environment-variables',
        {
          include: ['TAMAGUI_TARGET'],
        },
      ],
      'react-native-reanimated/plugin',
    ],
    presets: ['babel-preset-expo'],
  };
};
