import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useNavigationContainerRef } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, useColorScheme as useSystemColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppDialogHost } from 'components/app-dialog-host';
import { AppDrawerProvider } from 'components/drawer/app-drawer';
import { ToastProviderWithViewport } from 'components/ui/molecules/Toast';
import { ThemeProvider as ReacticxThemeProvider, ThemeMode } from 'components/ui/organisms/theme-switch/context';
import { useThemeMode } from 'components/ui/organisms/theme-switch/hooks';
import { Colors } from 'constants/theme';
import { useAuthStore } from 'store/use-auth-store';
import { api } from 'utils/api';
import { Sentry, initSentry, navigationIntegration } from 'utils/sentry';
import { STORAGE_KEY, storage } from 'utils/storage';

initSentry();

export const unstable_settings = {
  anchor: '(tabs)',
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0F0F0F',
    card: '#0F0F0F',
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function RootLayout() {
  const systemColorScheme = useSystemColorScheme();
  const [initialTheme, setInitialTheme] = useState<ThemeMode>(systemColorScheme === 'dark' ? ThemeMode.Dark : ThemeMode.Light);
  const [themeSeed, setThemeSeed] = useState(0);

  useEffect(() => {
    let isMounted = true;

    void storage.getItem(STORAGE_KEY.THEME_MODE).then(value => {
      if (!isMounted) {
        return;
      }

      if (value === ThemeMode.Dark || value === ThemeMode.Light) {
        setInitialTheme(value);
        setThemeSeed(seed => seed + 1);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const persistThemeMode = useCallback((theme: ThemeMode) => {
    void storage.setItem(STORAGE_KEY.THEME_MODE, theme);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <ReacticxThemeProvider
            key={themeSeed}
            defaultTheme={initialTheme}
            onThemeChange={persistThemeMode}
            customLightColors={{
              background: Colors.light.background,
              card: Colors.light.card,
              text: Colors.light.text,
              textSecondary: Colors.light.secondary,
              accent: Colors.light.accent,
              primary: Colors.light.tint,
            }}
            customDarkColors={{
              background: Colors.dark.background,
              card: Colors.dark.card,
              text: Colors.dark.text,
              textSecondary: Colors.dark.secondary,
              accent: Colors.dark.accent,
              primary: Colors.dark.tint,
            }}>
            <ToastProviderWithViewport>
              <RootLayoutContent />
              <AppDialogHost />
            </ToastProviderWithViewport>
          </ReacticxThemeProvider>
        </KeyboardProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutContent() {
  const themeMode = useThemeMode();
  const ref = useNavigationContainerRef();
  const isDarkTheme = themeMode === ThemeMode.Dark;

  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  useEffect(() => {
    const initializeSession = async () => {
      const refreshToken = await storage.getItem(STORAGE_KEY.REFRESH_TOKEN);

      if (refreshToken && !useAuthStore.getState().accessToken) {
        try {
          // Attempt to refresh the session on app start
          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          await useAuthStore.getState().setTokens(accessToken, newRefreshToken);
        } catch (error) {
          console.error('Failed to initialize session:', error);
          // If refresh fails on start, we ensure store stays unauthenticated
        }
      }
    };

    initializeSession();
  }, []);

  return (
    <NavigationThemeProvider value={isDarkTheme ? CustomDarkTheme : DefaultTheme}>
      <AppDrawerProvider>
        <Stack>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
          <Stack.Screen name='chat/[id]' options={{ headerShown: false }} />
          <Stack.Screen name='modal' options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={isDarkTheme ? 'light' : 'dark'} />
      </AppDrawerProvider>
    </NavigationThemeProvider>
  );
}

export default Sentry.wrap(RootLayout);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
