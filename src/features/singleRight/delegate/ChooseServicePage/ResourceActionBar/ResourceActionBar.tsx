import * as React from 'react';
import { useState } from 'react';
import { Button } from '@digdir/design-system-react';
import { PlusIcon, MinusIcon } from '@navikt/aksel-icons';

import { ActionBar } from '@/components';

export interface ResourceActionBarProps {
  /** The subtitle to be displayed in the header of the ActionBar. */
  subtitle?: React.ReactNode;
  /** The title to be displayed in the header of the ActionBar. */
  title?: React.ReactNode;
  /** The children to be displayed as content inside the ActionBar. */
  children?: React.ReactNode;
}

export const ResourceActionBar = ({ subtitle, title, children }: ResourceActionBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [color, setColor] = useState<'neutral' | 'light' | 'warning' | 'success' | 'danger'>(
    'neutral',
  );

  const addButton = (
    <Button
      variant='quiet'
      icon={<PlusIcon title='add' />}
      size='medium'
      onClick={() => {
        setIsAdded(true);
        setColor('success');
      }}
    ></Button>
  );

  const removeButton = (
    <Button
      variant='quiet'
      icon={<MinusIcon title='remove' />}
      size='medium'
      onClick={() => {
        setIsAdded(false);
        setColor('neutral');
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
      {children}
    </ActionBar>
  );
};
