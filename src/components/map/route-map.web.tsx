import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Coordinate, MapLayer, SegmentSummary } from './types';

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
  followUser: boolean;
  onMapPress: (coordinate: Coordinate) => void;
};

export function RouteMap({
  center,
  routeCoordinates,
  liveCoordinates,
  waypoints,
  heatRoutes,
  segments,
  selectedSegmentId,
  showHeatmap,
  showSegments,
  mapLayer,
  onMapPress,
}: RouteMapProps) {
  const handlePress = () => {
    onMapPress({
      latitude: center.latitude + 0.004,
      longitude: center.longitude + 0.004,
    });
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={[styles.grid, mapLayer === 'satellite' && styles.satelliteGrid]} />
      <View style={styles.park} />
      <View style={styles.river} />

      {showHeatmap &&
        heatRoutes.map((_, index) => (
          <View
            key={`heat-${index}`}
            style={[
              styles.fakePolyline,
              styles.heatLine,
              {
                top: `${24 + index * 16}%`,
                left: `${8 + index * 12}%`,
                transform: [{ rotate: `${-12 + index * 18}deg` }],
              },
            ]}
          />
        ))}

      {showSegments &&
        segments.map((segment, index) => (
          <View
            key={segment.id}
            style={[
              styles.fakePolyline,
              styles.segmentLine,
              selectedSegmentId === segment.id && styles.selectedSegmentLine,
              {
                top: `${35 + index * 13}%`,
                left: `${18 + index * 11}%`,
                width: `${34 + index * 8}%`,
                transform: [{ rotate: `${8 + index * 12}deg` }],
              },
            ]}
          />
        ))}

      {routeCoordinates.length > 1 && <View style={[styles.fakePolyline, styles.routeLine]} />}
      {liveCoordinates.length > 1 && <View style={[styles.fakePolyline, styles.liveLine]} />}

      <View style={styles.currentMarker} />
      {waypoints.map((_, index) => (
        <View
          key={`waypoint-${index}`}
          style={[
            styles.waypoint,
            {
              top: `${45 + Math.sin(index) * 18}%`,
              left: `${45 + Math.cos(index) * 22}%`,
            },
          ]}
        />
      ))}

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Map preview</Text>
        <Text style={styles.noticeText}>Native maps render on iOS/Android. Web keeps route controls testable.</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#DDE7DE',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.52,
    backgroundColor: '#DDE7DE',
  },
  satelliteGrid: {
    backgroundColor: '#223326',
  },
  park: {
    position: 'absolute',
    width: '62%',
    height: '42%',
    borderRadius: 140,
    top: '10%',
    right: '-10%',
    backgroundColor: 'rgba(69, 171, 92, 0.38)',
    transform: [{ rotate: '-18deg' }],
  },
  river: {
    position: 'absolute',
    width: '120%',
    height: 86,
    left: '-10%',
    top: '42%',
    backgroundColor: 'rgba(72, 160, 214, 0.34)',
    transform: [{ rotate: '-12deg' }],
  },
  fakePolyline: {
    position: 'absolute',
    height: 7,
    borderRadius: 7,
  },
  heatLine: {
    width: '78%',
    backgroundColor: 'rgba(255, 138, 0, 0.24)',
  },
  segmentLine: {
    backgroundColor: '#36D399',
  },
  selectedSegmentLine: {
    backgroundColor: '#FF8A00',
    height: 9,
  },
  routeLine: {
    width: '68%',
    left: '15%',
    top: '50%',
    backgroundColor: '#FF5A1F',
    transform: [{ rotate: '-24deg' }],
  },
  liveLine: {
    width: '38%',
    left: '30%',
    top: '58%',
    backgroundColor: '#1E90FF',
    transform: [{ rotate: '18deg' }],
  },
  currentMarker: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    top: '48%',
    left: '48%',
    backgroundColor: '#1E90FF',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  waypoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF8A00',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  notice: {
    position: 'absolute',
    top: 120,
    left: 18,
    right: 18,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  noticeTitle: {
    fontWeight: '800',
    color: '#111111',
  },
  noticeText: {
    marginTop: 2,
    color: '#555555',
    fontSize: 12,
  },
});
