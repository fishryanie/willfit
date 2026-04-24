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

  const location = locations[0];
  const coordinate = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
  const sampleTimestamp = typeof location.timestamp === 'number' ? location.timestamp : Date.now();
  const routeRecordState = useRouteRecordStore.getState();

  routeRecordState.syncElapsedTime(sampleTimestamp);
  routeRecordState.addLiveCoordinate(coordinate, sampleTimestamp);

  if (useRouteRecordStore.getState().shouldAutoDiscard(sampleTimestamp)) {
    await useRouteRecordStore.getState().discardRecording();
  }
});

export { ROUTE_LOCATION_TRACKING_TASK, startRouteLocationTracking, stopRouteLocationTracking } from './route-location-tracking';
