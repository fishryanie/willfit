import * as TaskManager from 'expo-task-manager';
import { useRouteRecordStore } from '../store/use-route-record-store';
import { ROUTE_LOCATION_TRACKING_TASK } from './route-location-tracking';

TaskManager.defineTask(ROUTE_LOCATION_TRACKING_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('Route background location task error:', error);
    return;
  }

  const locations = data?.locations;
  if (!locations?.length) {
    return;
  }

  const routeRecordState = useRouteRecordStore.getState();
  const normalizedLocations = locations
    .map((location: any) => ({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: typeof location.coords.accuracy === 'number' ? location.coords.accuracy : undefined,
      timestamp: typeof location.timestamp === 'number' ? location.timestamp : Date.now(),
    }))
    .sort((a: Coordinate & { timestamp: number }, b: Coordinate & { timestamp: number }) => a.timestamp - b.timestamp);

  normalizedLocations.forEach((coordinate: Coordinate & { accuracy?: number; timestamp: number }) => {
    routeRecordState.syncElapsedTime(coordinate.timestamp);
    routeRecordState.addLiveCoordinate(coordinate, coordinate.timestamp);
  });

  const sampleTimestamp = normalizedLocations[normalizedLocations.length - 1]?.timestamp ?? Date.now();

  if (useRouteRecordStore.getState().shouldAutoDiscard(sampleTimestamp)) {
    await useRouteRecordStore.getState().discardRecording();
  }
});

export { ROUTE_LOCATION_TRACKING_TASK, startRouteLocationTracking, stopRouteLocationTracking } from './route-location-tracking';
