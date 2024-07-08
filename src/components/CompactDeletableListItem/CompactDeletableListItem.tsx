/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Button } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import * as React from 'react';
import { MinusCircleIcon } from '@navikt/aksel-icons';

import { useMediaQuery } from '@/resources/hooks';
import { getButtonIconSize } from '@/resources/utils';

import { BorderedList } from '../BorderedList';

import classes from './CompactDeletableListItem.module.css';

export enum ListTextColor {
  primary = 'primary',
  error = 'error',
}
export interface CompactDeletableListItemProps {
  removeCallback?: (() => void) | null;
  leftText: string;
  middleText?: string;
  startIcon?: React.ReactNode;
  contentColor?: ListTextColor;
}

export const CompactDeletableListItem = ({
  removeCallback,
  leftText,
  middleText,
  startIcon,
  contentColor = ListTextColor.primary,
}: CompactDeletableListItemProps) => {
  const { t } = useTranslation();
  const isSm = useMediaQuery('(max-width: 768px)');

  return (
    <BorderedList.Item borderStyle='dashed'>
      <div
        className={classes.compactListItem}
        data-testid='compact-list-item'
      >
        <div className={classes.baseListItemContent}>
          {startIcon && (
            <div className={cn(classes.listItemIcon, classes[`listItemIcon__${contentColor}`])}>
              {startIcon}
            </div>
          )}
          <div className={classes.listItemTexts}>
            <div className={cn(classes.leftText, classes[`leftText__${contentColor}`])}>
              {leftText}
            </div>
            {middleText && (
              <div className={cn(classes.middleText, classes[`middleText__${contentColor}`])}>
                {middleText}
              </div>
            )}
          </div>
          <div className={classes.deleteSection}>
            {removeCallback && (
              <Button
                variant={'tertiary'}
                color={'danger'}
                size='medium'
                onClick={removeCallback}
                icon={isSm}
                aria-label={
                  t('common.remove') +
                  ' ' +
                  t('api_delegation.api_delegation_choice') +
                  ' ' +
                  leftText +
                  ' ' +
                  t('common.to') +
                  ' ' +
                  middleText
                }
              >
                <MinusCircleIcon fontSize={getButtonIconSize(!isSm)} />
                {!isSm && t('common.remove')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </BorderedList.Item>
  );
};
