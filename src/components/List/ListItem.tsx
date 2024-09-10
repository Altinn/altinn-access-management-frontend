import React from 'react';
import cn from 'classnames';

import classes from './List.module.css';

export const ListItem = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) => {
  return <li className={cn(classes.listItem, className)}>{children}</li>;
};
