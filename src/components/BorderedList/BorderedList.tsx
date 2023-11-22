import type { ListProps } from '@digdir/design-system-react';
import { List } from '@digdir/design-system-react';
import cn from 'classnames';
import * as React from 'react';

import classes from './BorderedList.module.css';

export type BorderedListProps = {
  /**
   * Style of the border separating the items
   */
  borderStyle?: 'solid' | 'dashed';
} & ListProps;

export const BorderedList = ({
  borderStyle = 'dashed',
  children,
  className,
  ...rest
}: BorderedListProps) => {
  return (
    <List
      className={cn(classes.borderedList, { [classes[borderStyle]]: borderStyle }, className)}
      style={{ paddingLeft: 0 }}
      {...rest}
    >
      {children}
    </List>
  );
};
