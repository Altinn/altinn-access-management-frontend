import cn from 'classnames';
import * as React from 'react';
import type { DsListItemProps } from '@altinn/altinn-components';
import { DsListItem } from '@altinn/altinn-components';

import classes from './BorderedListItem.module.css';

export type BorderedListItemProps = {
  /**
   * Style of the border separating the items
   */
  borderStyle?: 'solid' | 'dashed';
} & DsListItemProps;

export const BorderedListItem = ({
  borderStyle = 'dashed',
  children,
  ...rest
}: BorderedListItemProps) => {
  return (
    <DsListItem
      className={cn(classes.borderedListItem, { [classes[borderStyle]]: borderStyle })}
      style={{ marginBottom: 0 }}
      {...rest}
    >
      {children}
    </DsListItem>
  );
};

BorderedListItem.displayName = 'BorderedList.Item';
