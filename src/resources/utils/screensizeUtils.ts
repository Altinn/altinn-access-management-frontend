import { useMediaQuery } from '@/resources/hooks';

const mobileBreakpoint = 768;
const tabletBreakpoint = 1024;

export const useIsMobileOrSmaller = () => useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);
export const useIsTabletOrSmaller = () => useMediaQuery(`(max-width: ${tabletBreakpoint}px)`);
