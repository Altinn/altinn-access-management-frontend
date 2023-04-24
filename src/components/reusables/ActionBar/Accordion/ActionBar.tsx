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
  color?: 'light' | 'neutral' | 'warning' | 'success' | 'danger';
}

export const ActionBar = ({
  children,
  open,
  onClick,
  iconVariant = ActionBarIconVariant.Primary,
  color = 'light',
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
          color,
        }}
      >
        {children}
      </ActionBarContext.Provider>
    </div>
  );
};

export default ActionBar;
