import type { ListItemProps } from '@digdir/design-system-react';
import { List } from '@digdir/design-system-react';
import cn from 'classnames';
import * as React from 'react';

import classes from './BorderedListItem.module.css';

export type BorderedListItemProps = {
  /**
   * Style of the border separating the items
   */
  borderStyle?: 'solid' | 'dashed';
} & ListItemProps;

export const BorderedListItem = ({
  borderStyle = 'dashed',
  children,
  ...rest
}: BorderedListItemProps) => {
  return (
    <List.Item
      className={cn(classes.borderedListItem, { [classes[borderStyle]]: borderStyle })}
      style={{ listStyle: 'none', marginBottom: 0 }}
      {...rest}
    >
      {children}
    </List.Item>
  );
};

BorderedListItem.displayName = 'BorderedList.Item';
