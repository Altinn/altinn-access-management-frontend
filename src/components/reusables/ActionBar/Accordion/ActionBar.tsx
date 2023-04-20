import * as React from 'react';
import { useId } from 'react';

import type { ClickHandler } from './Context';
import { ActionBarIconVariant, ActionBarContext } from './Context';
import classes from './ActionBar.module.css';

export interface ActionBarProps {
  children?: React.ReactNode;
  onClick: ClickHandler;
  open: boolean;
  iconVariant?: ActionBarIconVariant;
}

/**
 * @deprecated Use ActionBar from @digdir/design-system-react instead.
 */
export const ActionBar = ({
  children,
  open,
  onClick,
  iconVariant = ActionBarIconVariant.Primary,
}: ActionBarProps) => {
  const headerId = useId();
  const contentId = useId();
  return (
    <div className={classes.accordion}>
      <ActionBarContext.Provider
        value={{
          onClick,
          open,
          headerId,
          contentId,
          iconVariant,
        }}
      >
        {children}
      </ActionBarContext.Provider>
    </div>
  );
};

export default ActionBar;
