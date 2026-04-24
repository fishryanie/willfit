import type { LatLng } from 'react-native-maps';

const toRad = (degrees: number) => (degrees * Math.PI) / 180;

const haversineDistance = (start: LatLng, end: LatLng): number => {
  const earthRadius = 6371000;
  const dLat = toRad(end.latitude - start.latitude);
  const dLon = toRad(end.longitude - start.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(start.latitude)) * Math.cos(toRad(end.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

export const calculateRouteDistanceKm = (coordinates: LatLng[]): number => {
  if (coordinates.length < 2) {
    return 0;
  }

  let distance = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    distance += haversineDistance(coordinates[index - 1], coordinates[index]);
  }

  return distance / 1000;
};

