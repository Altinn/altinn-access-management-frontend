import * as React from 'react';

import classes from './DualElementsContainer.module.css';

export interface SplitButtonContainerProps {
  leftElement: React.ReactNode;
  rightElement: React.ReactNode;
}

export const DualElementsContainer = ({ leftElement, rightElement }: SplitButtonContainerProps) => {
  return (
    <div className={classes.elementContainer}>
      <div className={classes.leftElement}>{leftElement}</div>
      <div className={classes.rightElement}>{rightElement}</div>
    </div>
  );
};
