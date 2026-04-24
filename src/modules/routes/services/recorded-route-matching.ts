import type { LatLng } from 'react-native-maps';
import { calculateRouteDistanceKm } from '../utils/geo';

export type RecordedRoutePoint = LatLng & {
  accuracy?: number;
  timestamp?: number;
};

export type RoadMatchedRoute = {
  coordinates: LatLng[];
  distanceMeters: number;
  confidence: number;
  provider: 'osm';
};

type OsrmGeometry = {
  coordinates?: [number, number][];
};

type OsrmMatching = {
  confidence?: number;
  distance?: number;
  geometry?: OsrmGeometry;
};

type OsrmMatchResponse = {
  code?: string;
  matchings?: OsrmMatching[];
  tracepoints?: ({ distance?: number } | null)[];
};

type OsrmRouteResponse = {
  code?: string;
  routes?: {
    distance?: number;
    geometry?: OsrmGeometry;
  }[];
  waypoints?: {
    distance?: number;
  }[];
};

const OSM_MATCH_URL = process.env.EXPO_PUBLIC_OSM_MATCH_URL ?? 'https://routing.openstreetmap.de/routed-foot/match/v1/foot';
const OSM_ROUTE_URL = process.env.EXPO_PUBLIC_OSM_ROUTE_URL ?? 'https://routing.openstreetmap.de/routed-foot/route/v1/foot';

const MAX_MATCH_POINTS = 90;
const MAX_SNAP_DISTANCE_METERS = 55;
const DEFAULT_GPS_RADIUS_METERS = 22;
const MIN_MATCH_DISTANCE_METERS = 25;
const MIN_MATCH_CONFIDENCE = 0.25;
const MAX_UNMATCHED_RATIO = 0.45;
const MIN_MATCHED_TO_RAW_DISTANCE_RATIO = 0.35;
const MAX_MATCHED_TO_RAW_DISTANCE_RATIO = 4.5;

const formatLonLat = ({ latitude, longitude }: LatLng) => `${longitude.toFixed(6)},${latitude.toFixed(6)}`;
const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const fetchJson = async <T>(url: string): Promise<T | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
};

const isValidCoordinate = (point: RecordedRoutePoint) =>
  Number.isFinite(point.latitude) && Number.isFinite(point.longitude) && Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180;

const normalizeTrack = (coordinates: RecordedRoutePoint[]) => {
  const normalized: RecordedRoutePoint[] = [];

  coordinates.forEach(point => {
    if (!isValidCoordinate(point)) {
      return;
    }

    const previous = normalized[normalized.length - 1];
    if (previous && Math.abs(previous.latitude - point.latitude) < 0.000003 && Math.abs(previous.longitude - point.longitude) < 0.000003) {
      return;
    }

    normalized.push(point);
  });

  return normalized;
};

const downsampleTrack = (coordinates: RecordedRoutePoint[]) => {
  if (coordinates.length <= MAX_MATCH_POINTS) {
    return coordinates;
  }

  const lastIndex = coordinates.length - 1;
  const step = lastIndex / (MAX_MATCH_POINTS - 1);

  return Array.from({ length: MAX_MATCH_POINTS }, (_, index) => coordinates[Math.round(index * step)]).filter(
    (point, index, points) => index === 0 || point !== points[index - 1],
  );
};

const getRadius = (point: RecordedRoutePoint) => {
  if (typeof point.accuracy !== 'number' || !Number.isFinite(point.accuracy)) {
    return DEFAULT_GPS_RADIUS_METERS;
  }

  return Math.min(MAX_SNAP_DISTANCE_METERS, Math.max(8, Math.round(point.accuracy)));
};

const getMonotonicTimestamps = (coordinates: RecordedRoutePoint[]) => {
  if (!coordinates.every(point => typeof point.timestamp === 'number' && Number.isFinite(point.timestamp))) {
    return null;
  }

  let previousTimestamp = 0;

  return coordinates.map(point => {
    const timestamp = Math.max(previousTimestamp + 1, Math.floor((point.timestamp ?? 0) / 1000));
    previousTimestamp = timestamp;
    return timestamp;
  });
};

const mapGeometry = (coordinates: [number, number][] | undefined): LatLng[] =>
  coordinates?.map(([longitude, latitude]) => ({ latitude, longitude })) ?? [];

const getDistanceRatio = (matchedDistanceMeters: number, rawDistanceMeters: number) => {
  if (rawDistanceMeters < MIN_MATCH_DISTANCE_METERS) {
    return 1;
  }

  return matchedDistanceMeters / rawDistanceMeters;
};

const isReasonableMatchedRoute = (
  route: RoadMatchedRoute,
  rawDistanceMeters: number,
  tracepointCount: number,
  inputCount: number,
) => {
  if (route.coordinates.length < 2 || route.distanceMeters < MIN_MATCH_DISTANCE_METERS) {
    return false;
  }

  const unmatchedRatio = inputCount <= 0 ? 0 : 1 - tracepointCount / inputCount;
  const distanceRatio = getDistanceRatio(route.distanceMeters, rawDistanceMeters);

  return (
    route.confidence >= MIN_MATCH_CONFIDENCE &&
    unmatchedRatio <= MAX_UNMATCHED_RATIO &&
    distanceRatio >= MIN_MATCHED_TO_RAW_DISTANCE_RATIO &&
    distanceRatio <= MAX_MATCHED_TO_RAW_DISTANCE_RATIO
  );
};

const buildBaseParams = (coordinates: RecordedRoutePoint[]) =>
  new URLSearchParams({
    overview: 'full',
    geometries: 'geojson',
    steps: 'false',
    radiuses: coordinates.map(getRadius).join(';'),
  });

const fetchOsmMatchedRoute = async (coordinates: RecordedRoutePoint[], rawDistanceMeters: number): Promise<RoadMatchedRoute | null> => {
  if (coordinates.length < 3 || rawDistanceMeters < MIN_MATCH_DISTANCE_METERS) {
    return null;
  }

  const params = buildBaseParams(coordinates);
  params.set('tidy', 'true');

  const timestamps = getMonotonicTimestamps(coordinates);
  if (timestamps) {
    params.set('timestamps', timestamps.join(';'));
  }

  const url = `${trimTrailingSlash(OSM_MATCH_URL)}/${coordinates.map(formatLonLat).join(';')}?${params.toString()}`;
  const payload = await fetchJson<OsrmMatchResponse>(url);

  if (payload?.code !== 'Ok') {
    return null;
  }

  const matchings = payload.matchings ?? [];
  const matchedCoordinates = matchings.flatMap(matching => mapGeometry(matching.geometry?.coordinates));
  const distanceMeters = matchings.reduce((total, matching) => total + (matching.distance ?? 0), 0) || calculateRouteDistanceKm(matchedCoordinates) * 1000;
  const confidence =
    matchings.length > 0 ? matchings.reduce((total, matching) => total + (matching.confidence ?? 0), 0) / matchings.length : 0;
  const tracepointCount = payload.tracepoints?.filter(Boolean).length ?? coordinates.length;
  const route = {
    coordinates: matchedCoordinates,
    distanceMeters,
    confidence,
    provider: 'osm',
  } satisfies RoadMatchedRoute;

  return isReasonableMatchedRoute(route, rawDistanceMeters, tracepointCount, coordinates.length) ? route : null;
};

const fetchOsmRoutedTrace = async (coordinates: RecordedRoutePoint[], rawDistanceMeters: number): Promise<RoadMatchedRoute | null> => {
  if (coordinates.length < 2) {
    return null;
  }

  const params = buildBaseParams(coordinates);
  params.set('alternatives', 'false');

  const url = `${trimTrailingSlash(OSM_ROUTE_URL)}/${coordinates.map(formatLonLat).join(';')}?${params.toString()}`;
  const payload = await fetchJson<OsrmRouteResponse>(url);

  if (payload?.code !== 'Ok') {
    return null;
  }

  const snappedTooFar = payload.waypoints?.some(waypoint => typeof waypoint.distance === 'number' && waypoint.distance > MAX_SNAP_DISTANCE_METERS);
  if (snappedTooFar) {
    return null;
  }

  const route = payload.routes?.[0];
  const coordinatesOnRoad = mapGeometry(route?.geometry?.coordinates);
  if (!route || coordinatesOnRoad.length < 2) {
    return null;
  }

  const routedTrace = {
    coordinates: coordinatesOnRoad,
    distanceMeters: route.distance ?? calculateRouteDistanceKm(coordinatesOnRoad) * 1000,
    confidence: 0.5,
    provider: 'osm',
  } satisfies RoadMatchedRoute;
  const distanceRatio = getDistanceRatio(routedTrace.distanceMeters, rawDistanceMeters);

  return distanceRatio >= MIN_MATCHED_TO_RAW_DISTANCE_RATIO && distanceRatio <= MAX_MATCHED_TO_RAW_DISTANCE_RATIO ? routedTrace : null;
};

export const matchRecordedRouteToRoads = async (coordinates: RecordedRoutePoint[]): Promise<RoadMatchedRoute | null> => {
  const normalized = normalizeTrack(coordinates);
  const matchPoints = downsampleTrack(normalized);
  const rawDistanceMeters = calculateRouteDistanceKm(normalized) * 1000;

  if (matchPoints.length < 2 || rawDistanceMeters < MIN_MATCH_DISTANCE_METERS) {
    return null;
  }

  return (await fetchOsmMatchedRoute(matchPoints, rawDistanceMeters)) ?? (await fetchOsmRoutedTrace(matchPoints, rawDistanceMeters));
};
