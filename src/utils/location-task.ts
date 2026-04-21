import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { useWorkoutStore } from 'store/use-workout-store';

export const LOCATION_TRACKING_TASK = 'LOCATION_TRACKING_TASK';

TaskManager.defineTask(LOCATION_TRACKING_TASK, ({ data, error }: any) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    if (locations && locations.length > 0) {
      const location = locations[0];
      const coordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      // Update the global store
      useWorkoutStore.getState().addCoordinate(coordinate);
    }
  }
});

export const startBackgroundTracking = async () => {
  const isStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING_TASK);
  if (isStarted) return;

  await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000,
    distanceInterval: 5,
    foregroundService: {
      notificationTitle: 'WillFit đang record',
      notificationBody: 'Đang theo dõi vị trí của bạn ngầm.',
      notificationColor: '#FF8A00',
    },
    pausesLocationUpdatesAutomatically: false,
  });
};

export const stopBackgroundTracking = async () => {
  const isStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING_TASK);
  if (isStarted) {
    await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
  }
};
