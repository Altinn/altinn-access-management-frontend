import * as React from 'react';

import classes from './PageContent.module.css';

export interface PageContentProps {
  children?: React.ReactNode;
}

export const PageContent = ({ children }: PageContentProps) => {
  return <div className={classes.pageContent}>{children}</div>;
};
