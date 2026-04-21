import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import * as Network from 'expo-network';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuthStore } from 'store/use-auth-store';
import { api } from 'utils/api';
import { configureNotificationHandler, registerForPushNotificationsAsync } from 'utils/notifications';
import { STORAGE_KEY, storage } from 'utils/storage';

type NotificationPayload = Record<string, unknown>;

const readString = (value: unknown) => (typeof value === 'string' ? value : undefined);

const getAppVersion = () => Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? 'unknown';
const getDeviceName = () => Constants.deviceName ?? `${Platform.OS}-device`;
const decodeJwtUserId = (accessToken: string | null) => {
  if (!accessToken) return 'guest';
  const segments = accessToken.split('.');
  if (segments.length < 2) return 'auth';
  try {
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payloadJson = atob(normalized);
    const payload = JSON.parse(payloadJson) as { userId?: unknown };
    if (typeof payload.userId === 'string' && payload.userId) {
      return payload.userId;
    }
    return 'auth';
  } catch {
    return 'auth';
  }
};
const buildSyncSignature = (token: string, accessToken: string | null) =>
  `${token}|${decodeJwtUserId(accessToken)}|${Platform.OS}|${getAppVersion()}|${getDeviceName()}`;
const pendingSyncSignatures = new Set<string>();

const hasInternetConnection = async () => {
  const networkState = await Network.getNetworkStateAsync();
  return Boolean(networkState.isConnected && networkState.isInternetReachable !== false);
};

const resolveNotificationRoute = (payload: NotificationPayload) => {
  const directRoute = readString(payload.route) ?? readString(payload.path) ?? readString(payload.url);
  if (directRoute) {
    return directRoute;
  }

  const type = readString(payload.type);
  switch (type) {
    case 'home':
      return '/(tabs)/index';
    case 'chat_list':
      return '/(tabs)/chat';
    case 'chat': {
      const conversationId = readString(payload.conversationId) ?? readString(payload.chatId) ?? readString(payload.id);
      return conversationId ? `/chat/${conversationId}` : '/(tabs)/chat';
    }
    case 'workout':
      return '/(tabs)/workout';
    case 'history':
      return '/(tabs)/history';
    case 'add':
    case 'exercise':
      return '/(tabs)/add';
    default:
      return undefined;
  }
};

const handleNotificationNavigation = (response: Notifications.NotificationResponse | null) => {
  if (!response) return;

  const payload = response.notification.request.content.data as NotificationPayload;
  const route = resolveNotificationRoute(payload);

  if (!route) return;

  router.push(route as never);
};

export function usePushNotifications() {
  const accessToken = useAuthStore(state => state.accessToken);

  const syncPushToken = async (token: string, tokenForContext: string | null) => {
    const syncSignature = buildSyncSignature(token, tokenForContext);
    const lastSignature = await storage.getItem(STORAGE_KEY.PUSH_TOKEN_SYNC_SIGNATURE);
    const shouldSync = lastSignature !== syncSignature;

    if (!shouldSync) {
      if (__DEV__) {
        console.log('[notifications] Skip push sync: unchanged context');
      }
      return;
    }

    if (pendingSyncSignatures.has(syncSignature)) {
      return;
    }

    pendingSyncSignatures.add(syncSignature);

    try {
      const isOnline = await hasInternetConnection();
      if (!isOnline) {
        if (__DEV__) {
          console.log('[notifications] Skip push sync: no internet');
        }
        return;
      }

      await api.post('/common/push/register-device', {
        pushToken: token,
        platform: Platform.OS,
        appVersion: getAppVersion(),
        deviceName: getDeviceName(),
      });
      await storage.setItem(STORAGE_KEY.PUSH_TOKEN_SYNC_SIGNATURE, syncSignature);
      if (__DEV__) {
        console.log('[notifications] Synced push token to backend');
      }
    } catch (error) {
      console.error('[notifications] Failed to sync push token:', error);
      if (__DEV__) {
        console.log('[notifications] APP_API:', api.defaults.baseURL);
      }
    } finally {
      pendingSyncSignatures.delete(syncSignature);
    }
  };

  useEffect(() => {
    configureNotificationHandler();

    let isMounted = true;
    const handledNotificationIds = new Set<string>();

    const register = async () => {
      try {
        const token = await registerForPushNotificationsAsync();

        if (!isMounted || !token) {
          return;
        }

        const cachedToken = await storage.getItem(STORAGE_KEY.PUSH_TOKEN);
        if (cachedToken !== token) {
          await storage.setItem(STORAGE_KEY.PUSH_TOKEN, token);
        }

        await syncPushToken(token, useAuthStore.getState().accessToken);

        if (__DEV__) {
          console.log('[notifications] Expo push token:', token);
        }
      } catch (error) {
        console.error('[notifications] Failed to register push notifications:', error);
      }
    };

    void register();

    const syncLastNotificationResponse = async () => {
      const lastResponse = await Notifications.getLastNotificationResponseAsync();
      const notificationId = lastResponse?.notification.request.identifier;
      if (!notificationId || handledNotificationIds.has(notificationId)) {
        return;
      }

      handledNotificationIds.add(notificationId);
      handleNotificationNavigation(lastResponse);
    };

    void syncLastNotificationResponse();

    const notificationReceivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      if (__DEV__) {
        console.log('[notifications] Received:', notification.request.identifier);
      }
    });

    const notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const notificationId = response.notification.request.identifier;
      if (handledNotificationIds.has(notificationId)) return;

      handledNotificationIds.add(notificationId);
      handleNotificationNavigation(response);

      if (__DEV__) {
        console.log('[notifications] Opened from notification:', notificationId);
      }
    });

    return () => {
      isMounted = false;
      notificationReceivedSubscription.remove();
      notificationResponseSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const syncAfterLogin = async () => {
      const token = await storage.getItem(STORAGE_KEY.PUSH_TOKEN);
      if (!token) {
        return;
      }
      await syncPushToken(token, accessToken);
    };

    void syncAfterLogin();
  }, [accessToken]);
}
