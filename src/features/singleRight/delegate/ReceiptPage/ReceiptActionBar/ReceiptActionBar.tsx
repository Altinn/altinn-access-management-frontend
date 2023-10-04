/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import { forwardRef } from 'react';

import { ActionBar, type ActionBarProps } from '@/components';

import classes from './ReceiptActionBar.module.css';

export type ReceiptActionBarProps = Pick<
  ActionBarProps,
  'subtitle' | 'title' | 'children' | 'color' | 'additionalText' | 'defaultOpen'
>;

/**
 * This component renders an ActionBar specialized for 
 *
 * @example
 * <ReceiptActionBar
 *  subtitle={'service owner'}
 *  title={'service name'}
 *  color={'success'}
 *  additionalText={'help text'}
 *  defaultOpen={true}
 *  ref={ref}
  >
    <div>
      content inside the actionBar
    </div>
  </ReceiptActionBar>
 */

export const ReceiptActionBar = forwardRef<HTMLDivElement, ReceiptActionBarProps>(
  ({ subtitle, title, children, additionalText, color, defaultOpen }, ref) => {
    return (
      <ActionBar
        subtitle={subtitle}
        title={title}
        color={color}
        additionalText={additionalText}
        defaultOpen={defaultOpen}
        ref={ref}
      >
        <div className={classes.content}>
          <div>{children}</div>
        </div>
      </ActionBar>
    );
  },
);

ReceiptActionBar.displayName = 'ReceiptActionBar';
