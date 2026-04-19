import type { ReactElement } from 'react';

import type { ActivityMode, Coordinate, MapLayer, SegmentSummary } from './types';

type RouteMapProps = {
  center: Coordinate;
  routeCoordinates: Coordinate[];
  liveCoordinates: Coordinate[];
  waypoints: Coordinate[];
  heatRoutes: Coordinate[][];
  segments: SegmentSummary[];
  selectedSegmentId?: string;
  showHeatmap: boolean;
  showSegments: boolean;
  mapLayer: MapLayer;
  activityMode: ActivityMode;
  followUser: boolean;
  onMapPress: (coordinate: Coordinate) => void;
};

export declare function RouteMap(props: RouteMapProps): ReactElement;
