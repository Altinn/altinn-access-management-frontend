/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Button, ListItem } from '@digdir/design-system-react';
import { SvgIcon } from '@altinn/altinn-design-system';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import * as React from 'react';

import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';

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
  const { t } = useTranslation('common');

  return (
    <ListItem>
      <div
        className={classes.compactListItem}
        data-testid='compact-list-item'
      >
        <div className={classes.baseListItemContent}>
          {startIcon && (
            <div className={cn(classes.listItemIcon, classes[`listItemIcon__${contentColor}`])}>
              <SvgIcon
                width={14}
                height={14}
                svgIconComponent={startIcon}
                className={classes.listItemIcon}
              />
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
                variant={'quiet'}
                color={'danger'}
                icon={<MinusCircle />}
                onClick={removeCallback}
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
                {t('common.remove')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </ListItem>
  );
};
