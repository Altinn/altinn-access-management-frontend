import cn from 'classnames';
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
  /** className for styling the list */
  className?: string;
}

export const List = ({
  children,
  heading,
  spacing,
  className,
  background = true,
  ...props
}: ListProps) => {
  return (
    <>
      {heading}
      <ul
        className={cn(
          classes.list,
          spacing ? classes.spacious : classes.compact,
          background && classes.background,
          className,
        )}
        {...props}
      >
        {children}
      </ul>
    </>
  );
};
