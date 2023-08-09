import * as React from 'react';
import { useState } from 'react';
import { Button } from '@digdir/design-system-react';
import { PlusIcon, MinusIcon } from '@navikt/aksel-icons';

import { ActionBar, type ActionBarProps } from '@/components';

import classes from './ResourceActionBar.module.css';

export interface ResourceActionBarProps
  extends Pick<ActionBarProps, 'subtitle' | 'title' | 'children', 'color'> {
  /** The callback funciton for the action button click */
  actionButtonClick: () => void;
  /** The type of the ResourceActionBar to be displayed */
  type?: 'neutral' | 'failed' | 'success';
}

export const ResourceActionBar = ({
  subtitle,
  title,
  children,
  color,
  type,
  actionButtonClick,
}: ResourceActionBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const addButton = (
    <Button
      variant='quiet'
      icon={<PlusIcon title='add' />}
      size='medium'
      onClick={() => {
        actionButtonClick();
      }}
    ></Button>
  );

  const removeButton = (
    <Button
      variant='quiet'
      icon={<MinusIcon title='remove' />}
      size='medium'
      onClick={() => {
        actionButtonClick();
      }}
    ></Button>
  );

  return (
    <ActionBar
      subtitle={subtitle}
      title={title}
      open={isOpen}
      color={color}
      onClick={() => {
        setIsOpen(!isOpen);
      }}
      actions={isAdded ? removeButton : addButton}
    >
      <div className={classes.content}>{children}</div>
    </ActionBar>
  );
};
