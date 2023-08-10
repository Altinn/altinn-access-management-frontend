import * as React from 'react';
import { useState } from 'react';
import { Button } from '@digdir/design-system-react';
import { PlusIcon, MinusIcon } from '@navikt/aksel-icons';

import { ActionBar, type ActionBarProps } from '@/components';

import classes from './ResourceActionBar.module.css';

export interface ResourceActionBarProps extends ActionBarProps {
  /** The external state indicating whether the bar is as added or not */
  isAdded: boolean;
  /** The callback function to be called when the add button is pressed. */
  onAdd?: () => void;
  /** The callback function to be called when the remove button is pressed. */
  onRemove?: () => void;
}

export const ResourceActionBar = ({
  color,
  subtitle,
  title,
  children,
  onAdd,
  onRemove,
  isAdded,
}: ResourceActionBarProps) => {
  const addButton = (
    <Button
      variant='quiet'
      icon={<PlusIcon title='add' />}
      size='medium'
      onClick={() => {
        onAdd?.();
      }}
    ></Button>
  );

  const removeButton = (
    <Button
      variant='quiet'
      icon={<MinusIcon title='remove' />}
      size='medium'
      onClick={() => {
        onRemove?.();
      }}
    ></Button>
  );

  return (
    <ActionBar
      subtitle={subtitle}
      title={title}
      color={color}
      actions={isAdded ? removeButton : addButton}
    >
      <div className={classes.content}>{children}</div>
    </ActionBar>
  );
};
