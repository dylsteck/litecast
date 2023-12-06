// todo resolve turbo env eslint errors
export const getBaseUrl = () => {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const runtimeEnv = process.env.TAMAGUI_TARGET;
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const profile = process.env.EXPO_PUBLIC_PROFILE;
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const localHost = `http://localhost:${process.env.PORT ?? 3000}`;
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const VercelUrl = process.env.VERCEL_URL;

  if (runtimeEnv === 'web') {
    if (VercelUrl) {
      // if you build api package on cloud server, they must be pass their platform specific built in environment variables
      return `https://${VercelUrl}`;
    } else {
      // otherwise, we would guess runtime environment as local development
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      return localHost;
    }
  } else {
    // Native is similar as above
    if (profile === 'production') {
      return `https://<YOUR_WEB_URL>.vercel.app`;
    } else {
      return localHost;
    }
  }

  // If you want to divide into more stages, try the values below!
  // Vercel: NEXT_PUBLIC_VERCEL_ENV = production, preview, development
  // EAS: EAS_BUILD_PROFILE = production, preview, development (It's up to you how to name it in eas.json file)
};
