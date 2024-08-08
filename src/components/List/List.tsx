import classNames from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';
import classes from './List.module.css';

interface ListProps extends React.HTMLAttributes<HTMLElement> {
  /** children element(s) to be listed */
  children: React.ReactNode[];
  /** The heading to go above the list */
  heading?: ReactNode;
  /** Enable spacing between list items */
  spacing?: boolean;
  /** Whether the list should be transparent or have a background color */
  background?: boolean;
}

export const List = ({ children, heading, spacing, background = true, ...props }: ListProps) => {
  return (
    <>
      {heading}
      <ul
        className={classNames(
          classes.list,
          spacing ? classes.spacious : classes.compact,
          background && classes.background,
        )}
        {...props}
      >
        {children}
      </ul>
    </>
  );
};
