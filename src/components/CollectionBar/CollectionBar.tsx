import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronRightDoubleCircleFillIcon,
  FilesFillIcon,
  ChevronRightDoubleIcon,
} from '@navikt/aksel-icons';
import cn from 'classnames';
import { useNavigate } from 'react-router';
import { DsButton, DsParagraph } from '@altinn/altinn-components';

import { ActionBar, type ActionBarProps } from '../ActionBar';

import classes from './CollectionBar.module.css';

export interface CollectionBarProps extends Pick<ActionBarProps, 'color' | 'title'> {
  /** The list of selected objects */
  collection: React.ReactNode[];

  /** When true saves as much space as possible. Usually used for smaller screens */
  compact?: boolean;

  /** The path to redirect to when pressing the proceed button */
  proceedToPath?: string;

  /** Disables proceeding to path when true */
  disabledProceedButton?: boolean;
}

export const CollectionBar = ({
  color = 'neutral',
  title,
  collection,
  compact = false,
  proceedToPath,
  disabledProceedButton,
}: CollectionBarProps) => {
  const { t } = useTranslation();
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
        size='large'
        subtitle={
          compact && (
            <span role='status'>{collection.length.toString() + ' ' + t('common.added')}</span>
          )
        }
        additionalText={
          !compact && (
            <DsParagraph
              role='status'
              data-size='sm'
              className={cn(classes.counterText, classes[color])}
            >
              <FilesFillIcon
                height={20}
                width={20}
              />
              {collection.length.toString() + ' ' + t('common.added')}
            </DsParagraph>
          )
        }
        actions={
          !compact && (
            <DsButton
              variant='tertiary'
              data-size='sm'
              className={cn(classes.buttonText, classes[color])}
              onClick={proceedClick}
              disabled={disabledProceedButton}
            >
              <ChevronRightDoubleCircleFillIcon fontSize={'1.5rem'} /> {t('common.proceed')}
            </DsButton>
          )
        }
        color={color}
      >
        <div className={cn(classes.content, { [classes.compact]: compact })}>{collection}</div>
      </ActionBar>
      {compact && (
        <DsButton
          className={classes.compactProceedButton}
          variant='tertiary'
          data-size='sm'
          onClick={proceedClick}
          disabled={disabledProceedButton}
        >
          {t('common.proceed')} <ChevronRightDoubleIcon fontSize={'1.2rem'} />
        </DsButton>
      )}
    </>
  );
};
