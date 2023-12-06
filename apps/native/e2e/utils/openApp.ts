import { AppJSONConfig } from '@expo/config/build/Config.types';
import appJSON from '../../app.json';
import { sleep } from './common';
import { resolveConfig } from 'detox/internals';

async function openApp() {
  const { configurationName } = await resolveConfig();
  const [platform, target] = configurationName.split('.') ?? ['', ''];

  if (target === 'debug') {
    return await openAppForDebugBuild(platform);
  } else {
    return await device.launchApp({
      newInstance: true,
    });
  }
}

async function openAppForDebugBuild(platform: string) {
  const deepLinkUrl = process.env.EXPO_USE_UPDATES
    ? // Testing latest published EAS update for the test_debug channel
      getDeepLinkUrl(getLatestUpdateUrl())
    : // Local testing with packager
      getDeepLinkUrl(getDevLauncherPackagerUrl(platform));

  if (platform === 'ios') {
    await device.launchApp({
      newInstance: true,
    });
    sleep(3000);
    await device.openURL({
      url: deepLinkUrl,
    });
  } else {
    await device.launchApp({
      newInstance: true,
      url: deepLinkUrl,
    });
  }

  await sleep(3000);
}

const getDeepLinkUrl = (url: string | number | boolean) =>
  `${appJSON.expo.name}://expo-development-client/?url=${encodeURIComponent(
    url,
  )}`;

const getDevLauncherPackagerUrl = (platform: string) =>
  `http://localhost:8081/index.bundle?platform=${platform}&dev=true&minify=false&disableOnboarding=1`;

const getLatestUpdateUrl = () =>
  `https://u.expo.dev/${getAppId()}?channel-name=test_debug&disableOnboarding=1`;

const getAppId = () =>
  (appJSON as AppJSONConfig)?.expo?.extra?.eas?.projectId ?? '';

export { openApp };
