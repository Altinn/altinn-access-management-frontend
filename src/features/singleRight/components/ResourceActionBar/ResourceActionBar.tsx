/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import { useMemo, useState } from 'react';
import { PlusCircleIcon, ExclamationmarkTriangleIcon, ArrowUndoIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { DsButton, DsParagraph, DsSpinner, DsValidationMessage } from '@altinn/altinn-components';

import classes from './ResourceActionBar.module.css';

import { ActionBar, type ActionBarProps } from '@/components';
import { useUpdate } from '@/resources/hooks/useUpdate';
import { usePrevious } from '@/resources/hooks';
import { ServiceStatus } from '@/rtk/features/singleRights/singleRightsSlice';
import { getButtonIconSize } from '@/resources/utils';

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
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const previousStatus = usePrevious(status);

  useUpdate(() => {
    if (
      (status === ServiceStatus.NotDelegable ||
        status === ServiceStatus.HTTPError ||
        status === ServiceStatus.Unauthorized) &&
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
      case ServiceStatus.HTTPError:
      case ServiceStatus.Unauthorized:
        return 'danger';
      default:
        return 'neutral';
    }
  }, [status]);

  const addButton = (
    <DsButton
      variant='tertiary'
      data-size={compact ? 'lg' : 'md'}
      onClick={() => {
        onAddClick?.();
      }}
      icon={compact}
      className={classes.actionBarButtonText}
    >
      {!compact && (status === ServiceStatus.HTTPError ? t('common.try_again') : t('common.add'))}
      <PlusCircleIcon
        title='add'
        fontSize={getButtonIconSize(!compact)}
      />
    </DsButton>
  );

  const undoButton = (
    <DsButton
      variant='tertiary'
      data-size={compact ? 'lg' : 'md'}
      onClick={onRemoveClick}
      icon={compact}
    >
      {!compact && t('common.undo')}
      <ArrowUndoIcon
        title={t('common.undo')}
        fontSize={getButtonIconSize(!compact)}
      />
    </DsButton>
  );

  const loadingText = (
    <DsParagraph
      className={classes.loadingText}
      data-size='sm'
    >
      <DsSpinner
        aria-label={t('common.loading')}
        data-size='sm'
      />
      {!compact && t('common.loading')}
    </DsParagraph>
  );

  const notDelegableLabel = (
    <DsValidationMessage
      className={classes.notDelegableContainer}
      onClick={() => {
        setOpen(!open);
      }}
      data-size='md'
    >
      {!compact && errorText}
      <ExclamationmarkTriangleIcon
        fontSize={getButtonIconSize(!compact)}
        aria-label={errorText}
      />
    </DsValidationMessage>
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
      case ServiceStatus.Unauthorized:
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
