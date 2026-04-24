export const formatMinutesPace = (minutesPerKm: number) => {
  const minutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - minutes) * 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}/km`;
};

export const formatDurationClock = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const formatDistanceKilometers = (distanceMeters: number) => `${(distanceMeters / 1000).toFixed(2)} km`;

export const formatLivePace = (distanceMeters: number, elapsedSeconds: number) => {
  if (distanceMeters < 10 || elapsedSeconds < 1) {
    return '--';
  }

  const secondsPerKm = elapsedSeconds / (distanceMeters / 1000);
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);

  return `${minutes}:${String(seconds).padStart(2, '0')}/km`;
};

export const estimateCalories = (distanceMeters: number) => Math.max(0, Math.round((distanceMeters / 1000) * 62));

