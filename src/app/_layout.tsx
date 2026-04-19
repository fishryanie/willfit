import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useNavigationContainerRef } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';

import { AppDrawerProvider } from 'components/drawer/app-drawer';
import { useColorScheme } from 'hooks/use-color-scheme';
import { Sentry, initSentry, navigationIntegration } from 'utils/sentry';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from 'lib/api';
import { useAuthStore } from 'store/use-auth-store';
import { storage, StorageKeys } from 'lib/storage';

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
  const colorScheme = useColorScheme();
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  useEffect(() => {
    const initializeSession = async () => {
      const refreshToken = storage.getString(StorageKeys.REFRESH_TOKEN);
      
      if (refreshToken && !useAuthStore.getState().accessToken) {
        try {
          // Attempt to refresh the session on app start
          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          useAuthStore.getState().setTokens(accessToken, newRefreshToken);
        } catch (error) {
          console.error('Failed to initialize session:', error);
          // If refresh fails on start, we don't necessarily logout 
          // unless the API explicitly returned 401/403
        }
      }
    };

    initializeSession();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : DefaultTheme}>
            <AppDrawerProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            </AppDrawerProvider>
          </ThemeProvider>
        </KeyboardProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
