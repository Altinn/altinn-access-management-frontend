import type { HTMLAttributes } from 'react';

import classes from './PageDivider.module.css';

type PageDividerProps = HTMLAttributes<HTMLHRElement>;

export const PageDivider = ({ className, ...rest }: PageDividerProps) => {
  return (
    <hr
      className={classes.divider}
      {...rest}
    />
  );
};
