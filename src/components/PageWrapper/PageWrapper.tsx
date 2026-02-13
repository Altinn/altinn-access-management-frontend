import * as React from 'react';

import classes from './PageWrapper.module.css';

export interface PageWrapperProps {
  children: React.ReactNode;
  pageAction?: React.ReactNode;
}

export const PageWrapper = ({ children, pageAction }: PageWrapperProps) => {
  return (
    <div className={classes.background}>
      {pageAction ? <div className={classes.pageAction}>{pageAction}</div> : null}
      {children}
    </div>
  );
};
