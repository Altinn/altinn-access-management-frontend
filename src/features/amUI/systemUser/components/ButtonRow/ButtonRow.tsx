import React from 'react';
import cn from 'classnames';

import classes from './ButtonRow.module.css';

interface ButtonRowProps {
  smallMarginTop?: boolean;
  children: React.ReactNode;
}

export const ButtonRow = ({ children }: ButtonRowProps): React.ReactNode => {
  const classNames = cn(classes.buttonRow, {
    [classes.smallMarginTop]: classes.smallMarginTop,
  });
  return <div className={classNames}>{children}</div>;
};
