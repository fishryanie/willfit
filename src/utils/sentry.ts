import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';

const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';
const hasDsn = Boolean(process.env.EXPO_PUBLIC_SENTRY_DSN);

// Only enable Sentry for real production builds.
export const isSentryEnabled = !__DEV__ && appEnv === 'production' && hasDsn;

export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: isSentryEnabled && !isRunningInExpoGo(),
});

export const initSentry = () => {
  Sentry.init({
    enabled: isSentryEnabled,
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    debug: false,
    sendDefaultPii: true,

    // Tracing
    tracesSampleRate: isSentryEnabled ? 1.0 : 0,

    // Profiling
    profilesSampleRate: isSentryEnabled ? 1.0 : 0,

    // Session Replay
    replaysOnErrorSampleRate: isSentryEnabled ? 1.0 : 0,
    replaysSessionSampleRate: isSentryEnabled ? 0.1 : 0,

    integrations: isSentryEnabled ? [navigationIntegration, Sentry.mobileReplayIntegration()] : [],

    enableNativeFramesTracking: isSentryEnabled && !isRunningInExpoGo(),
    environment: appEnv,
  });
};

export { Sentry };
