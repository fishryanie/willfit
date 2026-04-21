import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = {
  SAVED_ROUTES: 'willfit:saved-routes',
  REFRESH_TOKEN: 'willfit:rfk_v1_z9x_auth'
} as const;

type StorageKey = (typeof STORAGE_KEY)[keyof typeof STORAGE_KEY];

export const storage = {
  setItem: async (key: StorageKey, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('Error saving data', e);
    }
  },
  getItem: async (key: StorageKey) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error('Error reading data', e);
      return null;
    }
  },
  removeItem: async (key: StorageKey) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing data', e);
    }
  },
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Error clearing data', e);
    }
  },
};
