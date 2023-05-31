import * as React from 'react';
import cn from 'classnames';
import { SvgIcon } from '@altinn/altinn-design-system';
import { Heading } from '@digdir/design-system-react';

import { usePageContext } from './Context';
import classes from './PageHeader.module.css';

export interface PageHeaderProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

export const PageHeader = ({ children, icon }: PageHeaderProps) => {
  const { color, size } = usePageContext();

  return (
    <header
      className={cn(
        classes['page-header'],
        classes[`page-header--${color}`],
        classes[`page-header--${size}`],
      )}
    >
      <SvgIcon
        className={classes[`page-header__icon--${size}`]}
        svgIconComponent={icon}
      />
      <h1 className={classes.headerText}>{children}</h1>
    </header>
  );
};
