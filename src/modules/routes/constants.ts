export const MIN_DISTANCE = 0.005; // 5 mét
export const AUTO_DISCARD_AFTER_MS = 5 * 60 * 1000;

export const ROUTE_STORAGE_KEY = {
  SAVED_ROUTE_SUGGESTIONS: 'willfit:saved-route-suggestions',
} as const;

export const ROUTE_COLORS = {
  primary: '#2F80ED',
  accent: '#56CCF2',
  completed: '#FF3CAC',
} as const;

export const DEFAULT_MAP_DELTA = Object.freeze({
  latitudeDelta: 0.005,
  longitudeDelta: 0.005,
});

export const HCM_CITY_REGION = Object.freeze({
  latitude: 10.762622,
  longitude: 106.660172,
  ...DEFAULT_MAP_DELTA,
});
