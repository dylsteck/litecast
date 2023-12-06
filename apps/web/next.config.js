const { withTamagui } = require('@tamagui/next-plugin');
const withBundleAnalyzer = require('@next/bundle-analyzer');
const { join } = require('path');

const plugins = [
  withBundleAnalyzer({
    enabled: process.env.NODE_ENV === 'production',
    openAnalyzer: process.env.ANALYZE === 'true',
  }),
  withTamagui({
    config: './tamagui.config.ts',
    components: ['tamagui', 'ui'],
    importsWhitelist: ['constants.js', 'colors.js'],
    outputCSS:
      process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
    logTimings: true,
    disableExtraction: process.env.NODE_ENV === 'development',
    shouldExtract: path => {
      if (path.includes(join('packages', 'app'))) {
        return true;
      }
    },
    useReactNativeWebLite: false,
    excludeReactNativeWebExports: [
      'Switch',
      'ProgressBar',
      'Picker',
      'CheckBox',
      'Touchable',
    ],
  }),
];

const addSVGRModuleRule = config => {
  // Grab the existing rule that handles SVG imports

  const fileLoaderRule = config.module.rules.find(rule =>
    rule.test?.test?.('.svg'),
  );

  config.module.rules.push(
    // Reapply the existing rule, but only for svg imports ending in ?url
    {
      ...fileLoaderRule,
      test: /\.svg$/i,
      resourceQuery: /url/, // *.svg?url
    },
    // Convert all other *.svg imports to React components
    {
      test: /\.svg$/i,
      resourceQuery: { not: /url/ }, // exclude if *.svg?url
      use: ['@svgr/webpack'],
    },
  );
  // Modify the file loader rule to ignore *.svg, since we have it handled now.

  fileLoaderRule.exclude = /\.svg$/i;
  return config;
};

module.exports = function () {
  /** @type {import('next').NextConfig} */
  let nextConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },
    reactStrictMode: true,
    compiler: {
      reactRemoveProperties: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'loremflickr.com',
        },
        {
          protocol: 'https',
          hostname: 'i.pravatar.cc',
        },
      ],
    },
    transpilePackages: [
      'solito',
      'react-native-web',
      'expo-linking',
      'expo-router',
      'expo-modules-core',
    ],
    modularizeImports: {
      '@tamagui/lucide-icons': {
        transform: `@tamagui/lucide-icons/dist/esm/icons/{{kebabCase member}}`,
        skipDefaultConversion: true,
      },
    },
    experimental: {
      serverActions: true,
      appDir: true,
      typedRoutes: true,
    },
    webpack: config => {
      config.resolve.extensions = [
        '.web.js',
        '.web.ts',
        '.web.tsx',
        ...config.resolve.extensions,
      ];

      addSVGRModuleRule(config);

      return config;
    },
  };

  for (const plugin of plugins) {
    nextConfig = {
      ...nextConfig,
      ...plugin(nextConfig),
    };
  }

  return nextConfig;
};
