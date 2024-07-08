import * as React from 'react';
import cn from 'classnames';

import { usePageContext } from './Context';
import classes from './PageHeader.module.css';

export interface PageHeaderProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

export const PageHeader = ({ children, icon }: PageHeaderProps) => {
  const { color, size } = usePageContext();

  return (
    <div className={cn(classes.pageHeader, classes[color], classes[size])}>
      <div className={cn(classes.icon, classes[size])}>{icon}</div>
      <h1 className={classes.headerText}>{children}</h1>
    </div>
  );
};
