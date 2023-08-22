import * as React from 'react';

import classes from './DualElementsContainer.module.css';

export interface SplitButtonContainerProps {
  /** The element to display on the left side */
  leftElement: React.ReactNode;

  /** The element to display on the right side */
  rightElement: React.ReactNode;
}

/**
 * @component
 * A component that displays two elements side by side within a container.
 
 * @example
 * <DualElementsContainer
 *  leftElement={<button>Left Button</button>}
 *  rightElement={<button>Right Button</button>}
 * />
 */

export const DualElementsContainer = ({ leftElement, rightElement }: SplitButtonContainerProps) => {
  return (
    <div className={classes.elementContainer}>
      <div className={classes.leftElement}>{leftElement}</div>
      <div className={classes.rightElement}>{rightElement}</div>
    </div>
  );
};
