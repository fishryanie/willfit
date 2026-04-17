import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from 'components/hello-wave';
import ParallaxScrollView from 'components/parallax-scroll-view';
import { ThemedText } from 'components/themed-text';
import { ThemedView } from 'components/themed-view';
import { HealthTrackerCard } from 'components/health/tracker-card';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">WillFit</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.contentContainer}>
        <HealthTrackerCard />
        
        <ThemedView style={styles.infoContainer}>
          <ThemedText type="subtitle">Sức khỏe của bạn</ThemedText>
          <ThemedText>
            Theo dõi vận động hàng ngày giúp bạn duy trì vóc dáng và sức khỏe bền bỉ.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  contentContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  infoContainer: {
    gap: 8,
    marginTop: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
