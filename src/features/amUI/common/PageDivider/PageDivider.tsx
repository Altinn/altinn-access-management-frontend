import type { HTMLAttributes } from 'react';
import cn from 'classnames';

import classes from './PageDivider.module.css';

type PageDividerProps = HTMLAttributes<HTMLHRElement>;

export const PageDivider = ({ className, ...rest }: PageDividerProps) => {
  return (
    <hr
      className={cn(classes.divider, className)}
      {...rest}
    />
  );
};
