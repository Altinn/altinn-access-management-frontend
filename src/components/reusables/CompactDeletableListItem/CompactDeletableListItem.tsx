import {
  Button,
  ButtonVariant,
  ListItem,
  ButtonColor,
  SvgIcon,
} from '@altinn/altinn-design-system';
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
  middleText: string;
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
            <div className={cn(classes.listItemIcon)}>
              <SvgIcon
                width={14}
                height={14}
                svgIconComponent={startIcon}
                className={classes.listItemIcon__error}
              ></SvgIcon>
            </div>
          )}
          <div className={classes.listItemTexts}>
            <div className={cn(classes.leftText, classes[`leftText__${contentColor}`])}>
              {leftText}
            </div>
            <div className={(classes.middleText, classes[`middleText__${contentColor}`])}>
              {middleText}
            </div>
          </div>
          <div className={classes.deleteSection}>
            {removeCallback && (
              <Button
                variant={ButtonVariant.Quiet}
                color={ButtonColor.Danger}
                icon={<MinusCircle />}
                onClick={removeCallback}
              >
                {t('api_delegation.delete')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </ListItem>
  );
};
