interface EASBuildPayload {
  id: string;
  accountName: string;
  projectName: string;
  buildDetailsPageUrl: string;
  parentBuildId?: string;
  appId: string;
  initiatingUserId: string;
  cancelingUserId?: null;
  platform: 'android' | 'ios';
  status: 'errored' | 'finished' | 'canceled';
  artifacts: {
    buildUrl?: string;
    logsS3KeyPrefix: string;
  };
  metadata: {
    appName: string;
    username: string;
    workflow: string;
    appVersion: string;
    appBuildVersion: string;
    cliVersion: string;
    sdkVersion: string;
    buildProfile: 'development' | 'preview' | 'production';
    distribution: string;
    appIdentifier: string;
    gitCommitHash: string;
    gitCommitMessage: string;
    runtimeVersion: string;
    channel?: string;
    releaseChannel?: string;
    reactNativeVersion: string;
    trackingContext: {
      platform: string;
      account_id: string;
      dev_client: false;
      project_id: string;
      tracking_id: string;
      project_type: string;
      dev_client_version: string;
    };
    credentialsSource: string;
    isGitWorkingTreeDirty: false;
    message: string;
    runFromCI: false;
  };
  metrics: {
    memory: number;
    buildEndTimestamp: number;
    totalDiskReadBytes: number;
    buildStartTimestamp: number;
    totalDiskWriteBytes: number;
    cpuActiveMilliseconds: number;
    buildEnqueuedTimestamp: number;
    totalNetworkEgressBytes: number;
    totalNetworkIngressBytes: number;
  };
  error?: {
    message: string;
    errorCode: string;
  };
  createdAt: string;
  enqueuedAt: string;
  provisioningStartedAt: string;
  workerStartedAt: string;
  completedAt: string;
  updatedAt: string;
  expirationDate: string;
  priority: 'high' | 'normal' | 'low';
  resourceClass: string;
  actualResourceClass: string;
  maxRetryTimeMinutes: number;
}
