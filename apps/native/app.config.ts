import { ConfigContext, ExpoConfig } from '@expo/config';
import * as _ from 'lodash';

const config = ({
  config,
}: Omit<ConfigContext, 'config'> & { config: ExpoConfig }): ExpoConfig => {
  const APP_ENV = process.env.EXPO_PUBLIC_PROFILE ?? 'development';
  const isProductionEnv = APP_ENV === 'production';
  const addEnvSuffix = (value: string | undefined) => {
    if (value) {
      return isProductionEnv ? value : value + '.' + APP_ENV;
    }
  };

  const override: Partial<ExpoConfig> = {
    android: {
      package: addEnvSuffix(config.android?.package),
    },
    ios: {
      bundleIdentifier: addEnvSuffix(config.ios?.bundleIdentifier),
    },
    name: addEnvSuffix(config.name),
    plugins: [
      [
        '@config-plugins/detox',
        {
          subdomains:
            process.env.EAS_BUILD_PROFILE === 'development' || !isProductionEnv
              ? '*'
              : ['10.0.2.2', 'localhost'],
        },
      ],
    ],
  };

  return _.merge<ExpoConfig, Partial<ExpoConfig>>(config, override);
};

export default config;
