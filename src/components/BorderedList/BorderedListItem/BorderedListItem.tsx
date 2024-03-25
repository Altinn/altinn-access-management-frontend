import type { ListItemProps } from '@digdir/designsystemet-react';
import { List } from '@digdir/designsystemet-react';
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
      style={{ marginBottom: 0 }}
      {...rest}
    >
      {children}
    </List.Item>
  );
};

BorderedListItem.displayName = 'BorderedList.Item';
