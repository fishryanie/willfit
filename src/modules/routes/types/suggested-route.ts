import type { LatLng } from 'react-native-maps';

export type SuggestedWalkingRoute = {
  id: string;
  name: string;
  distanceKm: number;
  estimatedElevationGain: number;
  estimatedDurationMin: number;
  difficulty: 'Dễ' | 'Vừa';
  coordinates: LatLng[];
  score: number;
  source?: 'generated' | 'recorded';
};
