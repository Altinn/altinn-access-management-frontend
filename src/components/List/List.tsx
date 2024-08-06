import classNames from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';
import classes from './List.module.css';

interface ListProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode[];
  heading?: ReactNode;
  compact?: boolean;
}

export const List = ({ children, heading, compact, ...props }: ListProps) => {
  return (
    <>
      {heading}
      <ul
        className={classNames(classes.list, compact ? classes.compact : classes.spacious)}
        {...props}
      >
        {children}
      </ul>
    </>
  );
};
