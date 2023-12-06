declare namespace NodeJS {
  export interface ProcessEnv {
    EXPO_PUBLIC_PROFILE: 'production' | 'development' | 'preview';
    SECRET_WEBHOOK_KEY: string;
  }
}
