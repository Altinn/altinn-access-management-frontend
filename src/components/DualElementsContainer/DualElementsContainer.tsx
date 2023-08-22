import * as React from 'react';

import classes from './DualElementsContainer.module.css';

/**
 * @component
 * A component that displays two elements side by side within a container.
 
 *
 * @param {React.ReactNode} leftElement - The element to display on the left side.
 * @param {React.ReactNode} rightElement - The element to display on the right side.
 *
 * @example
 * import React from 'react';
 * import { DualElementsContainer } from './DualElementsContainer';
 *
 * const MyComponent = () => {
 *   return (
 *     <DualElementsContainer
 *       leftElement={<button>Left Button</button>}
 *       rightElement={<button>Right Button</button>}
 *     />
 *   );
 * };
 */

export interface SplitButtonContainerProps {
  /** The element to display on the left side */
  leftElement: React.ReactNode;

  /** The element to display on the right side */
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
