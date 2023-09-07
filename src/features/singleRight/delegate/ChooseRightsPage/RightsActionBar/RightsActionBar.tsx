/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import { useMemo, useState } from 'react';
import { Button } from '@digdir/design-system-react';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import { ActionBar, type ActionBarProps } from '@/components';

import classes from './RightsActionBar.module.css';

export interface RightsActionBarProps
  extends Pick<ActionBarProps, 'subtitle' | 'title' | 'children'> {
  /** Indicates the status of the ActionBar */
  status: 'Delegable' | 'PartiallyDelegable';

  /** The callback function to be called when the remove button is pressed. */
  onRemoveClick?: () => void;

  /** Independent open state that can be used to open the ActionBar */
  initialOpen?: boolean;

  /** When true saves as much space as possible. Usually true for smaller screens */
  compact?: boolean;
}

export const RightsActionBar = ({
  subtitle,
  title,
  children,
  status,
  onRemoveClick,
  initialOpen,
  compact = false,
}: RightsActionBarProps) => {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(initialOpen);

  const color = useMemo(() => {
    switch (status) {
      case 'Delegable':
        return 'success';
      case 'PartiallyDelegable':
        return 'warning';
    }
  }, [status]);

  const removeButton = (
    <Button
      variant='quiet'
      icon={<MinusCircleIcon title={t('common.remove')} />}
      size={compact ? 'large' : 'medium'}
      onClick={onRemoveClick}
      iconPlacement='right'
    >
      {!compact && t('common.remove')}
    </Button>
  );

  return (
    <ActionBar
      subtitle={subtitle}
      title={title}
      color={color}
      actions={removeButton}
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
