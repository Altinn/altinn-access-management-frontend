/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import { useMemo, useState } from 'react';
import { Alert, Button, Heading, Paragraph } from '@digdir/design-system-react';
import { PlusCircleIcon, MinusCircleIcon, ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import { ActionBar, type ActionBarProps } from '@/components';
import { useMediaQuery } from '@/resources/hooks/useMediaQuery';

import classes from './ResourceActionBar.module.css';

export interface ResourceActionBarProps
  extends Pick<ActionBarProps, 'subtitle' | 'title' | 'children'> {
  /** Indicates the status of the ActionBar */
  status: 'Delegable' | 'NotDelegable' | undefined;
  /** The callback function to be called when the add button is pressed. */
  onAddClick?: () => void;
  /** The callback function to be called when the remove button is pressed. */
  onRemoveClick?: () => void;
  /** Shows details about why the service isn't delegable */
  notDelegableCode?: 'Unknown' | 'MissingRoleAccess' | 'MissingDelegationAccess' | undefined;
}

export const ResourceActionBar = ({
  subtitle,
  title,
  children,
  status = undefined,
  notDelegableCode = undefined,
  onAddClick,
  onRemoveClick,
}: ResourceActionBarProps) => {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(status === 'NotDelegable');
  const isSm = useMediaQuery('(max-width: 768px)');

  useMemo(() => {
    if (status === 'NotDelegable') {
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

  const LocalizeNotDelegableCode = () => {
    console.log(notDelegableCode);
    if (notDelegableCode === 'MissingRoleAccess') {
      return 'missing_role_access';
    } else if (notDelegableCode === 'MissingDelegationAccess') {
      return 'missing_delegation_access';
    } else if (notDelegableCode === 'Unknown') {
      return 'unknown';
    } else if (notDelegableCode === undefined) {
      return undefined;
    } else {
      return 'new_error';
    }
  };

  const addButton = (
    <Button
      variant='quiet'
      icon={<PlusCircleIcon title='add' />}
      size={isSm ? 'large' : 'medium'}
      onClick={onAddClick}
      iconPlacement='right'
    >
      {!isSm && t('common.add')}
    </Button>
  );

  const removeButton = (
    <Button
      variant='quiet'
      icon={<MinusCircleIcon title='remove' />}
      size={isSm ? 'large' : 'medium'}
      onClick={onRemoveClick}
      iconPlacement='right'
    >
      {!isSm && t('common.remove')}
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
      {!isSm && <Paragraph> {t(`single_rights.${LocalizeNotDelegableCode()}_title`)}</Paragraph>}
      <ExclamationmarkTriangleIcon
        title='a11y-title'
        fontSize='1.5rem'
        className={classes.notDelegableIcon}
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
        {notDelegableCode && (
          <Alert
            severity='danger'
            elevated={false}
          >
            <Heading size='xsmall'>
              {t(`single_rights.${LocalizeNotDelegableCode()}_title`)}
            </Heading>
            <Paragraph>{t(`single_rights.${LocalizeNotDelegableCode()}`)}</Paragraph>
          </Alert>
        )}
        <div>{children}</div>
      </div>
    </ActionBar>
  );
};
