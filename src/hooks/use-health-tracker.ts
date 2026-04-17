import { useEffect, useState, useRef } from 'react';
import { Pedometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { useSharedValue, withTiming } from 'react-native-reanimated';

export function useHealthTracker() {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [isPermissionsGranted, setIsPermissionsGranted] = useState(false);
  
  // Shared values for animations
  const stepsAnimated = useSharedValue(0);
  const distanceAnimated = useSharedValue(0); // in meters
  
  // State for simple display
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);

  const lastLocation = useRef<Location.LocationObject | null>(null);

  useEffect(() => {
    let subscription: Pedometer.PedometerSubscription | null = null;
    let locationSubscription: Location.LocationSubscription | null = null;

    async function subscribe() {
      // 1. Check Pedometer availability
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(String(isAvailable));

      // 2. Request Permissions
      const { status: pedometerStatus } = await Pedometer.requestPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

      if (pedometerStatus === 'granted' && locationStatus === 'granted') {
        setIsPermissionsGranted(true);

        // 3. Subscribe to Pedometer
        subscription = Pedometer.watchStepCount((result) => {
          stepsAnimated.value = withTiming(result.steps);
          setSteps(result.steps);
        });

        // 4. Subscribe to Location for distance
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 5, // update every 5 meters
          },
          (location) => {
            if (lastLocation.current) {
              const d = getDistance(
                lastLocation.current.coords.latitude,
                lastLocation.current.coords.longitude,
                location.coords.latitude,
                location.coords.longitude
              );
              const newDistance = distanceAnimated.value + d;
              distanceAnimated.value = withTiming(newDistance);
              setDistance(newDistance);
            }
            lastLocation.current = location;
          }
        );
      }
    }

    subscribe();

    return () => {
      subscription?.remove();
      locationSubscription?.remove();
    };
  }, []);

  return {
    stepsAnimated,
    distanceAnimated,
    steps,
    distance,
    isPedometerAvailable,
    isPermissionsGranted,
  };
}

// Haversine formula to calculate distance between two points in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
