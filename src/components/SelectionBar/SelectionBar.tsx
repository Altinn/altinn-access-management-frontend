import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRightDoubleCircleFillIcon, FilesFillIcon } from '@navikt/aksel-icons';
import { Button, Paragraph } from '@digdir/design-system-react';
import cn from 'classnames';

import { ActionBar } from '../ActionBar';

import classes from './SelectionBar.module.css';

export interface SelectionBarProps {
  /** The color variant. */
  color?: 'light' | 'dark' | 'neutral' | 'warning' | 'success' | 'danger';
  /** The subtitle to be displayed in the header. */
  subtitle?: React.ReactNode;
  /** The title to be displayed in the header. */
  title?: React.ReactNode;
  /** The list of selected objects */
  collection: React.ReactNode[];
  /** Whether or not to use the compact variant */
  compact?: boolean;
}

export const SelectionBar = ({
  color = 'neutral',
  subtitle,
  title,
  collection,
  compact = false,
}: SelectionBarProps) => {
  const { t } = useTranslation('common');

  return (
    <ActionBar
      title={title}
      subtitle={subtitle}
      additionalText={
        compact ? (
          <span
            role='status'
            className={cn(classes.counterSymbol, classes[color])}
          >
            {collection.length}
          </span>
        ) : (
          <Paragraph
            as={'span'}
            role='status'
            size='small'
            className={classes.counterText}
          >
            <FilesFillIcon
              height={20}
              width={20}
            />
            {collection.length.toString() + ' ' + t('common.added')}
          </Paragraph>
        )
      }
      actions={
        !compact && (
          <Button
            variant='quiet'
            icon={<ChevronRightDoubleCircleFillIcon />}
            color={color === 'dark' ? 'inverted' : undefined}
          >
            {t('common.proceed')}
          </Button>
        )
      }
      size='large'
      color={color}
    >
      <div className={classes.content}>{collection}</div>
    </ActionBar>
  );
};
