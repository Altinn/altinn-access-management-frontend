import classNames from 'classnames';
import React, { ReactNode } from 'react';
import classes from './List.module.css';

export const List = ({
  children,
  heading,
  compact,
}: {
  children: React.ReactNode[];
  heading?: ReactNode;
  compact?: boolean;
}) => {
  return (
    <>
      {heading}
      <ul className={classNames(classes.list, compact ? classes.compact : classes.spacious)}>
        {children}
      </ul>
    </>
  );
};
