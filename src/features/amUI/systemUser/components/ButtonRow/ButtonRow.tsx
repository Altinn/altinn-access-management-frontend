import React from 'react';

import classes from './ButtonRow.module.css';

interface ButtonRowProps {
  children: React.ReactNode;
}

export const ButtonRow = ({ children }: ButtonRowProps): React.ReactNode => {
  return <div className={classes.buttonRow}>{children}</div>;
};
