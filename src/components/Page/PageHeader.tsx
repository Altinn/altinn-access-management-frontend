import * as React from 'react';
import cn from 'classnames';
import { SvgIcon } from '@altinn/altinn-design-system';

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
      <SvgIcon
        className={cn(classes.icon, classes[size])}
        svgIconComponent={icon}
      />
      <h1 className={classes.headerText}>{children}</h1>
    </div>
  );
};
