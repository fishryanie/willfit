import * as Sentry from '@sentry/react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { isRunningInExpoGo } from 'expo';
import { Stack, useNavigationContainerRef } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from 'hooks/use-color-scheme';

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || 'YOUR_SENTRY_DSN_HERE',
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

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayout() {
  const colorScheme = useColorScheme();
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default Sentry.wrap(RootLayout);
