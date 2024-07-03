import * as React from 'react';

import classes from './PageWrapper.module.css';

export interface PageWrapperProps {
  children: React.ReactNode;
}

export const PageWrapper = ({ children }: PageWrapperProps) => {
  return <div className={classes.background}>{children}</div>;
};
