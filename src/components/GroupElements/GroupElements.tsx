import * as React from 'react';

import classes from './GroupElements.module.css';

export interface GroupElementsProps {
  /** The list of elements to place besides eachother*/
  children: React.ReactNode[];
}

/**
 * @component
 * A component that displays elements side by side within a container. You can place as many components besides eachother as you want. 
 * You must have at least 2 components as children for the component to work.
 
 * @example
 * <GroupElements>
 *  <Button>Previous</Button>
 *  <Button>Next</Button>
 * </GroupElements>
 */

export const GroupElements = ({ children }: GroupElementsProps) => {
  return (
    <ul className={classes.list}>
      {children?.map((child: React.ReactNode, index: number) => (
        <li
          className={classes.listItem}
          key={`element-${index}`}
        >
          {child}
        </li>
      ))}
    </ul>
  );
};
