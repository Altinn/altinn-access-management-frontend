import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronRightDoubleCircleFillIcon,
  FilesFillIcon,
  ChevronRightDoubleIcon,
} from '@navikt/aksel-icons';
import { Button, Paragraph } from '@digdir/design-system-react';
import cn from 'classnames';
import { useNavigate } from 'react-router-dom';

import { ActionBar, type ActionBarProps } from '../ActionBar';

import classes from './CollectionBar.module.css';

export interface CollectionBarProps extends Pick<ActionBarProps, 'color' | 'title'> {
  /** The list of selected objects */
  collection: React.ReactNode[];

  /** When true saves as much space as possible. Usually used for smaller screens */
  compact?: boolean;

  /** The path to redirect to when pressing the proceed button */
  proceedToPath?: string;
}

export const CollectionBar = ({
  color = 'neutral',
  title,
  collection,
  compact = false,
  proceedToPath,
}: CollectionBarProps) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const proceedClick = () => {
    if (proceedToPath) {
      navigate(proceedToPath);
    }
  };

  return (
    <>
      <ActionBar
        title={title}
        subtitle={
          compact && (
            <span role='status'>{collection.length.toString() + ' ' + t('common.added')}</span>
          )
        }
        additionalText={
          !compact && (
            <Paragraph
              as={'span'}
              role='status'
              size='small'
              className={cn(classes.counterText, classes[color])}
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
              size='small'
              icon={<ChevronRightDoubleCircleFillIcon />}
              color={color === 'dark' ? 'inverted' : undefined}
              onClick={proceedClick}
            >
              {t('common.proceed')}
            </Button>
          )
        }
        size='large'
        color={color}
      >
        <div className={cn(classes.content, { [classes.compact]: compact })}>{collection}</div>
      </ActionBar>
      {compact && (
        <Button
          className={classes.compactProceedButton}
          variant='quiet'
          size='small'
          icon={<ChevronRightDoubleIcon />}
          iconPlacement='right'
          onClick={proceedClick}
        >
          {t('common.proceed')}
        </Button>
      )}
    </>
  );
};
