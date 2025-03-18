import { useMediaQuery } from '@digdir/designsystemet-react';

const mobileBreakpoint = 768;
const tabletBreakpoint = 1024;

const useIsMobileOrSmaller = () => useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);
export const useIsTabletOrSmaller = () => useMediaQuery(`(max-width: ${tabletBreakpoint}px)`);
