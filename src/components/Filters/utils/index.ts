import { MIN_YEAR } from '../types';

export const generateYearsList = (): number[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - MIN_YEAR + 1 }, (_, i) => currentYear - i);
};
