export const getReleaseYear = (releaseDate?: string): string => {
  return releaseDate ? releaseDate.split('-')[0] : 'N/A';
};

export const formatRuntime = (
  minutes?: number | null,
  hoursShortLabel = 'h',
  minutesShortLabel = 'm'
): string | null => {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0
    ? `${hours}${hoursShortLabel} ${mins}${minutesShortLabel}`
    : `${mins}${minutesShortLabel}`;
};
