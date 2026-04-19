import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

export const StorageKeys = {
  SAVED_ROUTES: 'willfit:saved-routes',
  REFRESH_TOKEN: '_rk_v1_z9x_auth', // Obscured key name for security
} as const;
