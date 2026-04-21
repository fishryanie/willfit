export const DEFAULT_COORDINATE: Coordinate = {
  latitude: 10.7769,
  longitude: 106.7009,
};

const EARTH_RADIUS_KM = 6371;

export function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${(distanceMeters / 1000).toFixed(2)} km`;
}

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function calculateDistance(from: Coordinate, to: Coordinate) {
  const latitudeDelta = degreesToRadians(to.latitude - from.latitude);
  const longitudeDelta = degreesToRadians(to.longitude - from.longitude);
  const fromLatitude = degreesToRadians(from.latitude);
  const toLatitude = degreesToRadians(to.latitude);

  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateTrackDistance(coordinates: Coordinate[]) {
  return coordinates.reduce((distance, coordinate, index) => {
    if (index === 0) {
      return 0;
    }

    return distance + calculateDistance(coordinates[index - 1], coordinate) * 1000;
  }, 0);
}

export function formatPace(distanceMeters: number, elapsedSeconds: number) {
  if (distanceMeters < 10 || elapsedSeconds < 1) {
    return '--';
  }

  const secondsPerKm = elapsedSeconds / (distanceMeters / 1000);
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);

  return `${minutes}:${String(seconds).padStart(2, '0')}/km`;
}

export function coordinateAtDistance(center: Coordinate, distanceKm: number, bearingDegrees: number) {
  const angularDistance = distanceKm / EARTH_RADIUS_KM;
  const bearing = degreesToRadians(bearingDegrees);
  const latitude = degreesToRadians(center.latitude);
  const longitude = degreesToRadians(center.longitude);

  const nextLatitude = Math.asin(Math.sin(latitude) * Math.cos(angularDistance) + Math.cos(latitude) * Math.sin(angularDistance) * Math.cos(bearing));
  const nextLongitude =
    longitude +
    Math.atan2(Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitude), Math.cos(angularDistance) - Math.sin(latitude) * Math.sin(nextLatitude));

  return {
    latitude: radiansToDegrees(nextLatitude),
    longitude: radiansToDegrees(nextLongitude),
  };
}

export function createLoopWaypoints(center: Coordinate, distanceKm: number) {
  const radiusKm = Math.max(distanceKm / 5.2, 0.6);

  return [
    center,
    coordinateAtDistance(center, radiusKm, 35),
    coordinateAtDistance(center, radiusKm * 1.12, 120),
    coordinateAtDistance(center, radiusKm * 0.9, 215),
    coordinateAtDistance(center, radiusKm * 0.65, 310),
    center,
  ];
}

export function createFallbackRoute(waypoints: Coordinate[]) {
  if (waypoints.length < 2) {
    return waypoints;
  }

  const route: Coordinate[] = [];

  waypoints.forEach((point, index) => {
    const nextPoint = waypoints[index + 1];
    route.push(point);

    if (!nextPoint) {
      return;
    }

    for (let step = 1; step < 8; step += 1) {
      const progress = step / 8;
      const wobble = Math.sin(progress * Math.PI) * 0.00055;
      route.push({
        latitude: point.latitude + (nextPoint.latitude - point.latitude) * progress + wobble,
        longitude: point.longitude + (nextPoint.longitude - point.longitude) * progress - wobble * 0.6,
      });
    }
  });

  return route;
}

export async function fetchOsrmRoute(waypoints: Coordinate[], mode: ActivityMode, signal?: AbortSignal) {
  if (waypoints.length < 2) {
    return waypoints;
  }

  const profile = mode === 'ride' ? 'bike' : 'foot';
  const coordinates = waypoints.map(point => `${point.longitude},${point.latitude}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson&steps=false`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`OSRM route failed with status ${response.status}`);
  }

  const payload = await response.json();
  const route = payload?.routes?.[0]?.geometry?.coordinates;

  if (!Array.isArray(route)) {
    throw new Error('OSRM route did not include geometry');
  }

  return route.map(([longitude, latitude]: [number, number]) => ({
    latitude,
    longitude,
  }));
}

export function createRouteSummaries(center: Coordinate, mode: ActivityMode = 'run'): RouteSummary[] {
  const baseElevation = Math.round(Math.abs(center.latitude - 10) * 40);

  if (mode === 'walk') {
    return [
      {
        id: 'walk-neighborhood',
        title: 'Neighborhood easy walk',
        distanceKm: 3.2,
        elevationM: 12 + baseElevation,
        estimatedMinutes: 38,
        surface: 'Sidewalk + park path',
        popularity: 92,
      },
      {
        id: 'walk-park-loop',
        title: 'Park walking loop',
        distanceKm: 5.8,
        elevationM: 20 + baseElevation,
        estimatedMinutes: 70,
        surface: 'Park path',
        popularity: 89,
      },
      {
        id: 'walk-long-loop',
        title: 'Long city walk',
        distanceKm: 9.6,
        elevationM: 34 + baseElevation,
        estimatedMinutes: 116,
        surface: 'Road + sidewalk',
        popularity: 82,
      },
    ];
  }

  if (mode === 'ride') {
    return [
      {
        id: 'ride-river-loop',
        title: 'River ride loop',
        distanceKm: 12.4,
        elevationM: 38 + baseElevation,
        estimatedMinutes: 40,
        surface: 'Road + riverside path',
        popularity: 94,
      },
      {
        id: 'ride-city-tempo',
        title: 'City tempo ride',
        distanceKm: 24.8,
        elevationM: 86 + baseElevation,
        estimatedMinutes: 78,
        surface: 'Road',
        popularity: 88,
      },
      {
        id: 'ride-long-aerobic',
        title: 'Long aerobic ride',
        distanceKm: 42,
        elevationM: 160 + baseElevation,
        estimatedMinutes: 132,
        surface: 'Mixed road',
        popularity: 81,
      },
    ];
  }

  return [
    {
      id: 'morning-loop',
      title: 'Morning river loop',
      distanceKm: 5.2,
      elevationM: 28 + baseElevation,
      estimatedMinutes: 32,
      surface: 'Road + park path',
      popularity: 94,
    },
    {
      id: 'city-tempo',
      title: 'City tempo route',
      distanceKm: 10,
      elevationM: 62 + baseElevation,
      estimatedMinutes: 58,
      surface: 'Road',
      popularity: 88,
    },
    {
      id: 'long-aerobic',
      title: 'Long aerobic loop',
      distanceKm: 21.1,
      elevationM: 140 + baseElevation,
      estimatedMinutes: 124,
      surface: 'Mixed',
      popularity: 81,
    },
  ];
}

export function createSegments(center: Coordinate): SegmentSummary[] {
  return [
    {
      id: 'sprint-bridge',
      title: 'Bridge Sprint',
      distanceKm: 0.82,
      grade: '+1.4%',
      bestTime: '2:48',
      starred: true,
      coordinates: [coordinateAtDistance(center, 0.55, 22), coordinateAtDistance(center, 1.25, 43)],
    },
    {
      id: 'riverside-push',
      title: 'Riverside Push',
      distanceKm: 1.46,
      grade: 'flat',
      bestTime: '5:12',
      starred: false,
      coordinates: [coordinateAtDistance(center, 0.7, 125), coordinateAtDistance(center, 1.55, 146)],
    },
    {
      id: 'park-climb',
      title: 'Park Climb',
      distanceKm: 0.64,
      grade: '+3.8%',
      bestTime: '3:05',
      starred: true,
      coordinates: [coordinateAtDistance(center, 0.75, 250), coordinateAtDistance(center, 1.28, 230)],
    },
  ];
}

export function createHeatRoutes(center: Coordinate) {
  return [
    createFallbackRoute(createLoopWaypoints(coordinateAtDistance(center, 0.4, 18), 4.8)),
    createFallbackRoute(createLoopWaypoints(coordinateAtDistance(center, 0.55, 150), 7.4)),
    createFallbackRoute(createLoopWaypoints(coordinateAtDistance(center, 0.45, 270), 5.9)),
  ];
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value: number) {
  return (value * 180) / Math.PI;
}
