import { Pressable, StyleSheet } from 'react-native';

import { ThemedText, ThemedView } from 'components/base';

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
      <ThemedView absoluteFillObject opacity={0.52} backgroundColor={mapLayer === 'satellite' ? '#223326' : '#DDE7DE'} />
      <ThemedView
        position='absolute'
        width='62%'
        height='42%'
        radius={140}
        top='10%'
        right='-10%'
        backgroundColor='rgba(69, 171, 92, 0.38)'
        transform={[{ rotate: '-18deg' }]}
      />
      <ThemedView
        position='absolute'
        width='120%'
        height={86}
        left='-10%'
        top='42%'
        backgroundColor='rgba(72, 160, 214, 0.34)'
        transform={[{ rotate: '-12deg' }]}
      />

      {showHeatmap &&
        heatRoutes.map((route, index) => (
          <ThemedView
            key={`heat-${route[0]?.latitude ?? 'x'}-${route[0]?.longitude ?? 'x'}-${route[route.length - 1]?.latitude ?? 'x'}`}
            position='absolute'
            height={7}
            radius={7}
            width='78%'
            backgroundColor='rgba(255, 138, 0, 0.24)'
            top={`${24 + index * 16}%`}
            left={`${8 + index * 12}%`}
            transform={[{ rotate: `${-12 + index * 18}deg` }]}
          />
        ))}

      {showSegments &&
        segments.map((segment, index) => (
          <ThemedView
            key={segment.id}
            position='absolute'
            height={selectedSegmentId === segment.id ? 9 : 7}
            radius={7}
            backgroundColor={selectedSegmentId === segment.id ? '#FF8A00' : '#36D399'}
            top={`${35 + index * 13}%`}
            left={`${18 + index * 11}%`}
            width={`${34 + index * 8}%`}
            transform={[{ rotate: `${8 + index * 12}deg` }]}
          />
        ))}

      {routeCoordinates.length > 1 && (
        <ThemedView
          position='absolute'
          height={7}
          radius={7}
          width='68%'
          left='15%'
          top='50%'
          backgroundColor='#FF5A1F'
          transform={[{ rotate: '-24deg' }]}
        />
      )}
      {liveCoordinates.length > 1 && (
        <ThemedView
          position='absolute'
          height={7}
          radius={7}
          width='38%'
          left='30%'
          top='58%'
          backgroundColor='#1E90FF'
          transform={[{ rotate: '18deg' }]}
        />
      )}

      <ThemedView position='absolute' width={22} height={22} radius={11} top='48%' left='48%' backgroundColor='#1E90FF' borderWidth={3} borderColor='#FFFFFF' />
      {waypoints.map((waypoint, index) => (
        <ThemedView
          key={`waypoint-${waypoint.latitude}-${waypoint.longitude}`}
          position='absolute'
          width={16}
          height={16}
          radius={8}
          backgroundColor='#FF8A00'
          borderWidth={3}
          borderColor='#FFFFFF'
          top={`${45 + Math.sin(index) * 18}%`}
          left={`${45 + Math.cos(index) * 22}%`}
        />
      ))}

      <ThemedView position='absolute' top={120} left={18} right={18} padding={12} radius={8} backgroundColor='rgba(255,255,255,0.88)'>
        <ThemedText color='#111111' fontWeight='800'>
          Map preview
        </ThemedText>
        <ThemedText color='#555555' fontSize={12} marginTop={2}>
          Native maps render on iOS/Android. Web keeps route controls testable.
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#DDE7DE',
  },
});
