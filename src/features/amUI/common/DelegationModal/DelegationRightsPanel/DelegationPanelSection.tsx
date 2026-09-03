import type { ReactNode } from 'react';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import classes from './DelegationPanel.module.css';

/**
 * The status/description block of a delegation panel. Rendered by DelegationRightsPanel for its
 * `body` slot, and directly by panels that hoist their status section into a custom header.
 */
export const DelegationPanelSection = ({ children }: { children: ReactNode }) => {
  const isSmall = useIsMobileOrSmaller();

  return (
    <div
      className={classes.resourceInfo}
      data-size={isSmall ? 'xs' : 'md'}
    >
      {children}
    </div>
  );
};
