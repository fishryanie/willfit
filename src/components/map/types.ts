export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type ActivityMode = 'run' | 'ride' | 'walk' | 'hike';

export type MapLayer = 'standard' | 'satellite';

export type RouteSummary = {
  id: string;
  title: string;
  distanceKm: number;
  elevationM: number;
  estimatedMinutes: number;
  surface: string;
  popularity: number;
};

export type SegmentSummary = {
  id: string;
  title: string;
  distanceKm: number;
  grade: string;
  bestTime: string;
  starred: boolean;
  coordinates: Coordinate[];
};
