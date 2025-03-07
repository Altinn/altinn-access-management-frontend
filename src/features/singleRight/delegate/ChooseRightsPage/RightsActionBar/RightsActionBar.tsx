/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import { Button } from '@digdir/designsystemet-react';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import { ActionBar, type ActionBarProps } from '@/components';
import { getButtonIconSize } from '@/resources/utils';

export interface RightsActionBarProps
  extends Pick<ActionBarProps, 'subtitle' | 'title' | 'children' | 'color' | 'defaultOpen'> {
  /** The callback function to be called when the remove button is pressed. */
  onRemoveClick?: () => void;

  /** When true saves as much space as possible. Usually true for smaller screens */
  compact?: boolean;
}

export const RightsActionBar = ({
  subtitle,
  title,
  children,
  color,
  onRemoveClick,
  defaultOpen,
  compact = false,
}: RightsActionBarProps) => {
  const { t } = useTranslation();

  const removeButton = (
    <Button
      variant='tertiary'
      data-size={compact ? 'lg' : 'md'}
      onClick={onRemoveClick}
      icon={compact}
    >
      {!compact && t('common.remove')}{' '}
      <MinusCircleIcon
        fontSize={getButtonIconSize(!compact)}
        title={t('common.remove')}
      />
    </Button>
  );

  return (
    <ActionBar
      subtitle={subtitle}
      title={title}
      color={color}
      actions={removeButton}
      defaultOpen={defaultOpen}
    >
      {children}
    </ActionBar>
  );
};
