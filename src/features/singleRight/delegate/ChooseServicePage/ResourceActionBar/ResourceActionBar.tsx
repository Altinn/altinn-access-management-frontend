/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import { useMemo, useState } from 'react';
import { Button, Paragraph } from '@digdir/design-system-react';
import {
  PlusCircleIcon,
  MinusCircleIcon,
  ExclamationmarkTriangleIcon,
  ArrowUndoIcon,
} from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import { ActionBar, type ActionBarProps } from '@/components';
import { useUpdate } from '@/resources/hooks/useUpdate';
import { usePrevious } from '@/resources/hooks';

import classes from './ResourceActionBar.module.css';

export interface ResourceActionBarProps
  extends Pick<ActionBarProps, 'subtitle' | 'title' | 'children'> {
  /** Indicates the status of the ActionBar */
  status: 'Delegable' | 'NotDelegable' | 'Unchecked';

  /** The callback function to be called when the add button is pressed. */
  onAddClick?: () => void;

  /** The callback function to be called when the remove button is pressed. */
  onRemoveClick?: () => void;

  /** Shows details about why the service isn't delegable */
  errorText?: string | undefined;

  /** When true saves as much space as possible. Usually true for smaller screens */
  compact?: boolean;
}

export const ResourceActionBar = ({
  subtitle,
  title,
  children,
  status = 'Unchecked',
  errorText = undefined,
  onAddClick,
  onRemoveClick,
  compact = false,
}: ResourceActionBarProps) => {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);

  const previousStatus = usePrevious(status);

  useUpdate(() => {
    if (status === 'NotDelegable' && previousStatus !== undefined) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [status]);

  const color = useMemo(() => {
    if (status === 'Delegable') {
      return 'success';
    } else if (status === 'NotDelegable') {
      return 'danger';
    } else {
      return 'neutral';
    }
  }, [status]);

  const addButton = (
    <Button
      variant='quiet'
      icon={<PlusCircleIcon title='add' />}
      size={compact ? 'large' : 'medium'}
      onClick={onAddClick}
      iconPlacement='right'
    >
      {!compact && t('common.add')}
    </Button>
  );

  const removeButton = (
    <Button
      variant='quiet'
      icon={<ArrowUndoIcon title={t('common.undo')} />}
      size={compact ? 'large' : 'medium'}
      onClick={onRemoveClick}
      iconPlacement='right'
    >
      {!compact && t('common.undo')}
    </Button>
  );

  const notDelegableLabel = (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={classes.notDelegableContainer}
      onClick={() => {
        setOpen(!open);
      }}
    >
      {!compact && <Paragraph>{errorText}</Paragraph>}
      <ExclamationmarkTriangleIcon
        className={classes.notDelegableIcon}
        fontSize='1.5rem'
      />
    </div>
  );

  const action = () => {
    if (status === 'Delegable') {
      return removeButton;
    } else if (status === 'NotDelegable') {
      return notDelegableLabel;
    } else {
      return addButton;
    }
  };

  return (
    <ActionBar
      subtitle={subtitle}
      title={title}
      color={color}
      actions={action()}
      open={open}
      onClick={() => {
        setOpen(!open);
      }}
    >
      <div className={classes.content}>
        <div>{children}</div>
      </div>
    </ActionBar>
  );
};
