import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack, useNavigationContainerRef } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppDialogHost } from 'components/app-dialog-host';
import { AppDrawerProvider } from 'components/drawer/app-drawer';
import { ToastProviderWithViewport } from 'components/ui/molecules/Toast';
import { ThemeProvider } from 'components/ui/organisms/theme-switch';
import { ThemeMode } from 'constants/theme';
import { useAuthStore } from 'store/use-auth-store';
import { useThemeMode } from 'store/use-theme-store';
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
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <BottomSheetModalProvider>
            <ThemeProvider>
              <ToastProviderWithViewport>
                <RootLayoutContent />
                <AppDialogHost />
              </ToastProviderWithViewport>
            </ThemeProvider>
          </BottomSheetModalProvider>
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
