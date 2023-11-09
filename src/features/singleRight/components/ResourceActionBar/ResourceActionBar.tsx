/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import { useMemo, useState } from 'react';
import { Button, ErrorMessage, Paragraph, Spinner } from '@digdir/design-system-react';
import { PlusCircleIcon, ExclamationmarkTriangleIcon, ArrowUndoIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import { ActionBar, type ActionBarProps } from '@/components';
import { useUpdate } from '@/resources/hooks/useUpdate';
import { usePrevious } from '@/resources/hooks';
import { ServiceStatus } from '@/rtk/features/singleRights/singleRightsSlice';

import classes from './ResourceActionBar.module.css';

export interface ResourceActionBarProps
  extends Pick<ActionBarProps, 'subtitle' | 'title' | 'children'> {
  /** Indicates the status of the ActionBar */
  status: ServiceStatus;

  /** The callback function to be called when the add button is pressed. */
  onAddClick?: () => void;

  /** The callback function to be called when the remove button is pressed. */
  onRemoveClick?: () => void;

  /** Shows details about why the service isn't delegable */
  errorText?: string | undefined;

  /** When true saves as much space as possible. Usually true for smaller screens */
  compact?: boolean;

  /** Replaces the action with a pending spinner when true */
  isLoading?: boolean;
}

export const ResourceActionBar = ({
  subtitle,
  title,
  children,
  status = ServiceStatus.Unchecked,
  errorText = undefined,
  onAddClick,
  onRemoveClick,
  compact = false,
  isLoading = false,
}: ResourceActionBarProps) => {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);

  const previousStatus = usePrevious(status);

  useUpdate(() => {
    if (
      (status === ServiceStatus.NotDelegable || status === ServiceStatus.Error) &&
      previousStatus !== undefined
    ) {
      setOpen(true);
    }
  }, [status]);

  const color = useMemo(() => {
    switch (status) {
      case ServiceStatus.Delegable:
      case ServiceStatus.PartiallyDelegable:
        return 'success';
      case ServiceStatus.NotDelegable:
      case ServiceStatus.Error:
        return 'danger';
      default:
        return 'neutral';
    }
  }, [status]);

  const addButton = (
    <Button
      variant='tertiary'
      icon={<PlusCircleIcon title='add' />}
      size={compact ? 'large' : 'medium'}
      onClick={() => {
        onAddClick?.();
      }}
      iconPlacement='right'
    >
      {!compact && (status === ServiceStatus.Error ? t('common.try_again') : t('common.add'))}
    </Button>
  );

  const undoButton = (
    <Button
      variant='tertiary'
      icon={<ArrowUndoIcon title={t('common.undo')} />}
      size={compact ? 'large' : 'medium'}
      onClick={onRemoveClick}
      iconPlacement='right'
    >
      {!compact && t('common.undo')}
    </Button>
  );

  const loadingText = (
    <Paragraph className={classes.loadingText}>
      <Spinner
        title={t('common.loading')}
        variant='interaction'
      />
      {!compact && t('common.loading')}
    </Paragraph>
  );

  const notDelegableLabel = (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={classes.notDelegableContainer}
      onClick={() => {
        setOpen(!open);
      }}
    >
      {!compact && <ErrorMessage>{errorText} </ErrorMessage>}
      <ErrorMessage>
        <ExclamationmarkTriangleIcon
          className={classes.notDelegableIcon}
          fontSize='1.5rem'
          aria-label={errorText}
        />
      </ErrorMessage>
    </div>
  );

  const action = () => {
    if (isLoading) {
      return loadingText;
    }
    switch (status) {
      case ServiceStatus.Delegable:
      case ServiceStatus.PartiallyDelegable:
        return undoButton;
      case ServiceStatus.NotDelegable:
        return notDelegableLabel;
      default:
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
