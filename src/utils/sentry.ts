import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';

export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    debug: false,
    sendDefaultPii: true,

    // Tracing
    tracesSampleRate: 1.0,

    // Profiling
    profilesSampleRate: 1.0,

    // Session Replay
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,

    integrations: [
      navigationIntegration,
      Sentry.mobileReplayIntegration(),
    ],

    enableNativeFramesTracking: !isRunningInExpoGo(),
    environment: __DEV__ ? 'development' : 'production',
  });
};

export { Sentry };
