import * as Location from 'expo-location';

export const ROUTE_LOCATION_TRACKING_TASK = 'ROUTE_LOCATION_TRACKING_TASK';

export const startRouteLocationTracking = async () => {
  const isStarted = await Location.hasStartedLocationUpdatesAsync(ROUTE_LOCATION_TRACKING_TASK);
  if (isStarted) {
    return;
  }

  await Location.startLocationUpdatesAsync(ROUTE_LOCATION_TRACKING_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000,
    distanceInterval: 5,
    foregroundService: {
      notificationTitle: 'WillFit đang record',
      notificationBody: 'Đang theo dõi vị trí của bạn ngầm.',
      notificationColor: '#2F80ED',
    },
    pausesUpdatesAutomatically: false,
  });
};

export const stopRouteLocationTracking = async () => {
  const isStarted = await Location.hasStartedLocationUpdatesAsync(ROUTE_LOCATION_TRACKING_TASK);
  if (isStarted) {
    await Location.stopLocationUpdatesAsync(ROUTE_LOCATION_TRACKING_TASK);
  }
};
