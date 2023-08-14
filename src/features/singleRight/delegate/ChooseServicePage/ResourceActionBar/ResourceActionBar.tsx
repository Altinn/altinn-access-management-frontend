import * as React from 'react';
import { useMemo, useState } from 'react';
import { Alert, Button, Heading, Paragraph } from '@digdir/design-system-react';
import { PlusCircleIcon, MinusCircleIcon, ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import { ActionBar, type ActionBarProps } from '@/components';

import classes from './ResourceActionBar.module.css';

export interface ResourceActionBarProps extends ActionBarProps {
  /** Indicates the status of the ActionBar */
  status: 'Delegable' | 'NotDelegable' | undefined;
  /** The callback function to be called when the add button is pressed. */
  onAddClick?: () => void;
  /** The callback function to be called when the remove button is pressed. */
  onRemoveClick?: () => void;
  /** Shows details about why the service isn't delegable */
  notDelegableDetails?: string;
}

export const ResourceActionBar = ({
  subtitle,
  title,
  children,
  status = undefined,
  notDelegableDetails = '',
  onAddClick,
  onRemoveClick,
}: ResourceActionBarProps) => {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(status === 'NotDelegable');

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

  const addButton = (
    <Button
      variant='quiet'
      icon={<PlusCircleIcon title='add' />}
      size='medium'
      onClick={onAddClick}
      iconPlacement='right'
    >
      {t('common.add')}
    </Button>
  );

  const removeButton = (
    <Button
      variant='quiet'
      icon={<MinusCircleIcon title='remove' />}
      size='medium'
      onClick={onRemoveClick}
      iconPlacement='right'
    >
      {t('api_delegation.undo')}
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
      <p>{t('common.missing_delegable_right')}</p>
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
        <div>{children}</div>
        {notDelegableDetails && (
          <Alert
            severity='danger'
            elevated={false}
          >
            <Heading size='xsmall'>{t('common.missing_delegable_right')}</Heading>
            <Paragraph>{notDelegableDetails}</Paragraph>
          </Alert>
        )}
      </div>
    </ActionBar>
  );
};
