/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';

import { ActionBar, type ActionBarProps } from '@/components';

import classes from './ReceiptActionBar.module.css';

export interface ReceiptActionBarProps
  extends Pick<
    ActionBarProps,
    'subtitle' | 'title' | 'children' | 'color' | 'additionalText' | 'defaultOpen'
  > {
  /** Shows details about why the service isn't delegable */
  errorText?: string | undefined;
}

export const ReceiptActionBar = ({
  subtitle,
  title,
  children,
  additionalText,
  color,
  defaultOpen,
}: ReceiptActionBarProps) => {
  return (
    <ActionBar
      subtitle={subtitle}
      title={title}
      color={color}
      additionalText={additionalText}
      defaultOpen={defaultOpen}
    >
      <div className={classes.content}>
        <div>{children}</div>
      </div>
    </ActionBar>
  );
};
