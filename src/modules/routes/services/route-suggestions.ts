import type { LatLng } from 'react-native-maps';
import type { SuggestedWalkingRoute } from '../types/suggested-route';
import { calculateRouteDistanceKm } from '../utils/geo';

const DEFAULT_SUGGESTION_COUNT = 10;
const CANDIDATE_MULTIPLIER = 2;
const REQUEST_BATCH_SIZE = 3;
const MAX_SNAP_DISTANCE_METERS = 85;
const MAX_ROUTE_DISTANCE_KM = 5.25;
const MIN_ROUTE_DISTANCE_KM = 0.85;
const MIN_UNIQUE_GEOMETRY_RATIO = 0.58;

const OSM_ROUTE_URL = process.env.EXPO_PUBLIC_OSM_ROUTE_URL ?? 'https://routing.openstreetmap.de/routed-foot/route/v1/foot';
const GOONG_ROUTE_URL = process.env.EXPO_PUBLIC_GOONG_ROUTE_URL ?? 'https://rsapi.goong.io/Direction';
const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY;
const GOONG_VEHICLE = process.env.EXPO_PUBLIC_GOONG_VEHICLE ?? 'bike';
const ROUTE_PROVIDER = process.env.EXPO_PUBLIC_ROUTE_PROVIDER;

const ROUTE_NAMES = [
  'Vòng sông buổi sáng',
  'Đi bộ ven công viên',
  'Tuyến thư giãn đầu ngày',
  'Vòng nhẹ quanh khu dân cư',
  'Lối đi bộ ven kênh',
  'Đường cây xanh mát',
  'Nhịp đi bộ buổi chiều',
  'Tuyến dọc bờ sông',
  'Vòng đi bộ cuối ngày',
  'Đường yên tĩnh gần nhà',
] as const;

type RouteProvider = 'osm' | 'goong';

type RouteCandidate = {
  id: number;
  targetDistanceKm: number;
  waypoints: LatLng[];
  scoreSeed: number;
};

type RoadRouteResult = {
  coordinates: LatLng[];
  distanceMeters: number;
  durationSeconds?: number;
  provider: RouteProvider;
};

type FetchSuggestedWalkingRoutesOptions = {
  count?: number;
  signal?: AbortSignal;
};

type OsrmRouteResponse = {
  code?: string;
  routes?: {
    distance?: number;
    duration?: number;
    geometry?: {
      type?: string;
      coordinates?: [number, number][];
    };
  }[];
  waypoints?: {
    distance?: number;
  }[];
};

type GoongDirectionsResponse = {
  routes?: {
    legs?: {
      distance?: {
        value?: number;
      };
      duration?: {
        value?: number;
      };
    }[];
    overview_polyline?: {
      points?: string;
    };
  }[];
};

const toRadians = (value: number) => (value * Math.PI) / 180;
const toDegrees = (value: number) => (value * 180) / Math.PI;

const createSeed = (origin: LatLng): number => {
  const latitudeSeed = Math.floor((origin.latitude + 90) * 10000);
  const longitudeSeed = Math.floor((origin.longitude + 180) * 10000);
  return (latitudeSeed * 73856093) ^ (longitudeSeed * 19349663);
};

const createSeededRandom = (seedValue: number) => {
  let seed = seedValue >>> 0;
  return () => {
    seed = (1664525 * seed + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
};

const destinationPoint = (origin: LatLng, distanceMeters: number, bearingDegrees: number): LatLng => {
  const earthRadius = 6371000;
  const angularDistance = distanceMeters / earthRadius;
  const bearing = toRadians(bearingDegrees);
  const lat1 = toRadians(origin.latitude);
  const lon1 = toRadians(origin.longitude);

  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(angularDistance) + Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing));
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    latitude: toDegrees(lat2),
    longitude: toDegrees(lon2),
  };
};

const formatLonLat = ({ latitude, longitude }: LatLng) => `${longitude.toFixed(6)},${latitude.toFixed(6)}`;
const formatLatLng = ({ latitude, longitude }: LatLng) => `${latitude.toFixed(6)},${longitude.toFixed(6)}`;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const roundDistanceKm = (distanceMeters: number) => Number((distanceMeters / 1000).toFixed(2));

const buildCandidateRoutes = (origin: LatLng, count: number): RouteCandidate[] => {
  const random = createSeededRandom(createSeed(origin));
  const candidateCount = Math.max(count * CANDIDATE_MULTIPLIER, count + 6);

  return Array.from({ length: candidateCount }, (_, index) => {
    const targetDistanceKm = 1.6 + random() * 3.3;
    const waypointCount = index % 3 === 0 ? 2 : 3;
    const baseRadiusMeters = (targetDistanceKm * 1000) / (2 * Math.PI);
    const startBearing = random() * 360;
    const turnDirection = random() > 0.5 ? 1 : -1;

    const waypoints = Array.from({ length: waypointCount }, (__, waypointIndex) => {
      const bearingStep = (360 / (waypointCount + 1)) * (waypointIndex + 1);
      const bearingNoise = (random() - 0.5) * 32;
      const radiusFactor = 0.82 + random() * 0.42;

      return destinationPoint(origin, baseRadiusMeters * radiusFactor, startBearing + turnDirection * bearingStep + bearingNoise);
    });

    return {
      id: index + 1,
      targetDistanceKm,
      waypoints,
      scoreSeed: random(),
    };
  });
};

const decodePolyline = (encoded: string, precision = 5): LatLng[] => {
  const coordinates: LatLng[] = [];
  const factor = Math.pow(10, precision);
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);

    latitude += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);

    longitude += result & 1 ? ~(result >> 1) : result >> 1;

    coordinates.push({
      latitude: latitude / factor,
      longitude: longitude / factor,
    });
  }

  return coordinates;
};

const fetchJson = async <T>(url: string, signal?: AbortSignal): Promise<T | null> => {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
};

const normalizeWalkingDurationSeconds = (distanceMeters: number, durationSeconds?: number) => {
  if (durationSeconds && distanceMeters > 0) {
    const minutesPerKm = durationSeconds / 60 / (distanceMeters / 1000);
    if (minutesPerKm >= 8 && minutesPerKm <= 22) {
      return Math.round(durationSeconds);
    }
  }

  return Math.round((distanceMeters / 1000) * 11.4 * 60);
};

const isValidRoute = (route: RoadRouteResult) => {
  if (route.coordinates.length < 3 || route.distanceMeters <= 0) {
    return false;
  }

  const distanceKm = route.distanceMeters / 1000;
  const uniqueGeometryRatio =
    new Set(route.coordinates.map(point => `${point.latitude.toFixed(5)},${point.longitude.toFixed(5)}`)).size / route.coordinates.length;

  return distanceKm >= MIN_ROUTE_DISTANCE_KM && distanceKm <= MAX_ROUTE_DISTANCE_KM && uniqueGeometryRatio >= MIN_UNIQUE_GEOMETRY_RATIO;
};

const fetchOsmRoute = async (origin: LatLng, waypoints: LatLng[], signal?: AbortSignal): Promise<RoadRouteResult | null> => {
  const coordinates = [origin, ...waypoints, origin];
  const coordinatePath = coordinates.map(formatLonLat).join(';');
  const params = new URLSearchParams({
    overview: 'full',
    geometries: 'geojson',
    steps: 'false',
    alternatives: 'false',
    radiuses: coordinates.map(() => String(MAX_SNAP_DISTANCE_METERS)).join(';'),
  });
  const url = `${trimTrailingSlash(OSM_ROUTE_URL)}/${coordinatePath}?${params.toString()}`;
  const payload = await fetchJson<OsrmRouteResponse>(url, signal);

  if (payload?.code !== 'Ok') {
    return null;
  }

  const snappedTooFar = payload.waypoints?.some(waypoint => typeof waypoint.distance === 'number' && waypoint.distance > MAX_SNAP_DISTANCE_METERS);
  if (snappedTooFar) {
    return null;
  }

  const route = payload.routes?.[0];
  const routeCoordinates = route?.geometry?.coordinates;
  if (!route || !routeCoordinates?.length) {
    return null;
  }

  const mappedCoordinates = routeCoordinates.map(([longitude, latitude]) => ({ latitude, longitude }));

  return {
    coordinates: mappedCoordinates,
    distanceMeters: route.distance ?? calculateRouteDistanceKm(mappedCoordinates) * 1000,
    durationSeconds: route.duration,
    provider: 'osm',
  };
};

const fetchGoongRoute = async (origin: LatLng, waypoints: LatLng[], signal?: AbortSignal): Promise<RoadRouteResult | null> => {
  if (!GOONG_API_KEY) {
    return null;
  }

  const destinations = [...waypoints, origin].map(formatLatLng).join(';');
  const params = new URLSearchParams({
    origin: formatLatLng(origin),
    destination: destinations,
    vehicle: GOONG_VEHICLE,
    api_key: GOONG_API_KEY,
  });
  const url = `${GOONG_ROUTE_URL}?${params.toString()}`;
  const payload = await fetchJson<GoongDirectionsResponse>(url, signal);
  const route = payload?.routes?.[0];
  const encodedPolyline = route?.overview_polyline?.points;

  if (!encodedPolyline) {
    return null;
  }

  const routeCoordinates = decodePolyline(encodedPolyline);
  const legDistanceMeters = route.legs?.reduce((total, leg) => total + (leg.distance?.value ?? 0), 0) ?? 0;
  const legDurationSeconds = route.legs?.reduce((total, leg) => total + (leg.duration?.value ?? 0), 0) ?? 0;

  return {
    coordinates: routeCoordinates,
    distanceMeters: legDistanceMeters || calculateRouteDistanceKm(routeCoordinates) * 1000,
    durationSeconds: legDurationSeconds || undefined,
    provider: 'goong',
  };
};

const getProviderOrder = (): RouteProvider[] => {
  if (ROUTE_PROVIDER === 'goong') {
    return ['goong', 'osm'];
  }

  if (ROUTE_PROVIDER === 'osm') {
    return ['osm'];
  }

  return GOONG_API_KEY ? ['osm', 'goong'] : ['osm'];
};

const fetchRoadRoute = async (origin: LatLng, waypoints: LatLng[], signal?: AbortSignal) => {
  for (const provider of getProviderOrder()) {
    let route: RoadRouteResult | null = null;

    try {
      route = provider === 'goong' ? await fetchGoongRoute(origin, waypoints, signal) : await fetchOsmRoute(origin, waypoints, signal);
    } catch (error) {
      if (signal?.aborted) {
        throw error;
      }
    }

    if (route && isValidRoute(route)) {
      return route;
    }
  }

  return null;
};

const routeSignature = (coordinates: LatLng[]) => {
  const sampleCount = Math.min(5, coordinates.length);
  const step = Math.max(1, Math.floor(coordinates.length / sampleCount));

  return coordinates
    .filter((_, index) => index % step === 0)
    .slice(0, sampleCount)
    .map(point => `${point.latitude.toFixed(4)},${point.longitude.toFixed(4)}`)
    .join('|');
};

const isDuplicateRoute = (candidate: SuggestedWalkingRoute, routes: SuggestedWalkingRoute[]) => {
  const candidateSignature = routeSignature(candidate.coordinates);
  return routes.some(route => Math.abs(route.distanceKm - candidate.distanceKm) < 0.08 && routeSignature(route.coordinates) === candidateSignature);
};

const buildSuggestedRoute = (candidate: RouteCandidate, route: RoadRouteResult, index: number): SuggestedWalkingRoute => {
  const distanceKm = roundDistanceKm(route.distanceMeters);
  const durationSeconds = normalizeWalkingDurationSeconds(route.distanceMeters, route.durationSeconds);
  const estimatedDurationMin = Math.max(1, Math.round(durationSeconds / 60));
  const estimatedElevationGain = Math.max(4, Math.round(distanceKm * 7 + candidate.scoreSeed * 14));
  const distanceFit = Math.max(0, 1 - Math.abs(distanceKm - candidate.targetDistanceKm) / MAX_ROUTE_DISTANCE_KM);

  return {
    id: `walk-road-suggest-${candidate.id}`,
    name: ROUTE_NAMES[index % ROUTE_NAMES.length],
    distanceKm,
    estimatedElevationGain,
    estimatedDurationMin,
    difficulty: distanceKm <= 3.6 ? 'Dễ' : 'Vừa',
    coordinates: route.coordinates,
    score: Number((0.7 + distanceFit * 0.22 + candidate.scoreSeed * 0.08).toFixed(2)),
    source: 'generated',
    provider: route.provider,
  };
};

export const fetchSuggestedWalkingRoutes = async (
  origin: LatLng,
  options: FetchSuggestedWalkingRoutesOptions = {},
): Promise<SuggestedWalkingRoute[]> => {
  const count = options.count ?? DEFAULT_SUGGESTION_COUNT;
  const candidates = buildCandidateRoutes(origin, count);
  const suggestions: SuggestedWalkingRoute[] = [];

  for (let index = 0; index < candidates.length && suggestions.length < count; index += REQUEST_BATCH_SIZE) {
    const batch = candidates.slice(index, index + REQUEST_BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async candidate => {
        try {
          const route = await fetchRoadRoute(origin, candidate.waypoints, options.signal);
          return route ? buildSuggestedRoute(candidate, route, candidate.id - 1) : null;
        } catch (error) {
          if (options.signal?.aborted) {
            throw error;
          }

          return null;
        }
      }),
    );

    results.forEach(route => {
      if (!route || suggestions.length >= count || isDuplicateRoute(route, suggestions)) {
        return;
      }

      suggestions.push(route);
    });
  }

  return suggestions.sort((a, b) => b.score - a.score);
};
