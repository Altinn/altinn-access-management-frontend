import cn from 'classnames';
import * as React from 'react';
import { DsListUnordered, type DsListUnorderedProps } from '@altinn/altinn-components';

import classes from './BorderedList.module.css';

export type BorderedListProps = {
  /**
   * Style of the border separating the items
   */
  borderStyle?: 'solid' | 'dashed';
} & DsListUnorderedProps;

export const BorderedList = ({
  borderStyle = 'dashed',
  children,
  className,
  ...rest
}: BorderedListProps) => {
  return (
    <DsListUnordered
      className={cn(classes.borderedList, { [classes[borderStyle]]: borderStyle }, className)}
      style={{ paddingLeft: 0 }}
      {...rest}
    >
      {children}
    </DsListUnordered>
  );
};
