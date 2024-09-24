import type { ListUnorderedProps } from '@digdir/designsystemet-react';
import { ListUnordered } from '@digdir/designsystemet-react';
import cn from 'classnames';
import * as React from 'react';

import classes from './BorderedList.module.css';

export type BorderedListProps = {
  /**
   * Style of the border separating the items
   */
  borderStyle?: 'solid' | 'dashed';
} & ListUnorderedProps;

export const BorderedList = ({
  borderStyle = 'dashed',
  children,
  className,
  ...rest
}: BorderedListProps) => {
  return (
    <ListUnordered
      className={cn(classes.borderedList, { [classes[borderStyle]]: borderStyle }, className)}
      style={{ paddingLeft: 0 }}
      {...rest}
    >
      {children}
    </ListUnordered>
  );
};
