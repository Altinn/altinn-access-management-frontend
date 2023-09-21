/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionBar, type ActionBarProps } from '@/components';

import classes from './ResourceActionBar.module.css';

export interface ResourceActionBarProps
  extends Pick<ActionBarProps, 'subtitle' | 'title' | 'children' | 'color' | 'additionalText'> {
  /** Shows details about why the service isn't delegable */
  errorText?: string | undefined;

  /** When true saves as much space as possible. Usually true for smaller screens */
  compact?: boolean;
}

export const ResourceActionBar = ({
  subtitle,
  title,
  children,
  additionalText,
}: ResourceActionBarProps) => {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);

  const color = useMemo(() => {
    switch (status) {
      case 'Delegable':
      case 'PartiallyDelegable':
        return 'success';
      case 'NotDelegable':
        return 'danger';
      default:
        return 'neutral';
    }
  }, [status]);

  return (
    <ActionBar
      subtitle={subtitle}
      title={title}
      color={color}
      additionalText={additionalText}
    >
      <div className={classes.content}>
        <div>{children}</div>
      </div>
    </ActionBar>
  );
};
