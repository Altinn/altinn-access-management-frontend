import * as React from 'react';

import { type PageColor, PageContext, type PageSize } from './Context';
import classes from './Page.module.css';

export interface PageProps {
  children?: React.ReactNode;
  color?: PageColor;
  size?: PageSize;
}

export const Page = ({ children, color = 'dark', size = 'medium' }: PageProps) => {
  return (
    <main className={classes.page}>
      <PageContext.Provider value={{ color, size }}>{children}</PageContext.Provider>
    </main>
  );
};
