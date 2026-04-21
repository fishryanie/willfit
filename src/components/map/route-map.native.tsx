import { ThemedView } from 'components/base';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Circle, Marker, Polyline, type MapPressEvent } from 'react-native-maps';

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
  followUser,
  onMapPress,
}: RouteMapProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!followUser) {
      return;
    }

    mapRef.current?.animateToRegion(
      {
        ...center,
        latitudeDelta: 0.035,
        longitudeDelta: 0.035,
      },
      450,
    );
  }, [center, followUser]);

  const handleMapPress = (event: MapPressEvent) => {
    onMapPress(event.nativeEvent.coordinate);
  };

  const liveLastPoint = liveCoordinates[liveCoordinates.length - 1];
  const firstWaypoint = waypoints[0];
  const lastWaypoint = waypoints.length > 1 ? waypoints[waypoints.length - 1] : undefined;

  return (
    <ThemedView backgroundColor='transparent' style={StyleSheet.absoluteFill}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        mapType={mapLayer}
        initialRegion={{
          ...center,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        showsCompass
        showsScale
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        onPress={handleMapPress}>
        {showHeatmap &&
          heatRoutes.map(route => (
            <Polyline
              key={`heat-${route[0]?.latitude ?? 'x'}-${route[0]?.longitude ?? 'x'}-${route[route.length - 1]?.latitude ?? 'x'}`}
              coordinates={route}
              strokeColor='rgba(255, 138, 0, 0.24)'
              strokeWidth={10}
              lineCap='round'
              lineJoin='round'
            />
          ))}

        {showSegments &&
          segments.map(segment => (
            <Polyline
              key={segment.id}
              coordinates={segment.coordinates}
              strokeColor={selectedSegmentId === segment.id ? '#FF8A00' : '#36D399'}
              strokeWidth={selectedSegmentId === segment.id ? 6 : 4}
              lineDashPattern={selectedSegmentId === segment.id ? undefined : [8, 7]}
              lineCap='round'
              lineJoin='round'
            />
          ))}

        {routeCoordinates.length > 1 && <Polyline coordinates={routeCoordinates} strokeColor='#FF5A1F' strokeWidth={6} lineCap='round' lineJoin='round' />}

        {liveCoordinates.length > 1 && <Polyline coordinates={liveCoordinates} strokeColor='#1E90FF' strokeWidth={5} lineCap='round' lineJoin='round' />}

        <Circle center={center} radius={70} fillColor='rgba(30, 144, 255, 0.14)' strokeColor='rgba(30, 144, 255, 0.45)' strokeWidth={1} />

        <Marker coordinate={center} anchor={{ x: 0.5, y: 0.5 }}>
          <ThemedView style={styles.currentLocationMarker}>
            <ThemedView style={styles.currentLocationDot} />
          </ThemedView>
        </Marker>

        {firstWaypoint && (
          <Marker coordinate={firstWaypoint} title='Start'>
            <ThemedView style={[styles.pin, styles.startPin]} />
          </Marker>
        )}

        {lastWaypoint && (
          <Marker coordinate={lastWaypoint} title='Finish'>
            <ThemedView style={[styles.pin, styles.finishPin]} />
          </Marker>
        )}

        {waypoints.slice(1, -1).map(waypoint => (
          <Marker key={`${waypoint.latitude}-${waypoint.longitude}`} coordinate={waypoint}>
            <ThemedView style={styles.waypoint}>
              <ThemedView style={styles.waypointInner} />
            </ThemedView>
          </Marker>
        ))}

        {liveLastPoint && (
          <Marker coordinate={liveLastPoint} title='Live position'>
            <ThemedView style={styles.liveMarker} />
          </Marker>
        )}
      </MapView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  currentLocationMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(30, 144, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E90FF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  startPin: {
    backgroundColor: '#36D399',
  },
  finishPin: {
    backgroundColor: '#FF5A1F',
  },
  waypoint: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF8A00',
  },
  waypointInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF8A00',
  },
  liveMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1E90FF',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
