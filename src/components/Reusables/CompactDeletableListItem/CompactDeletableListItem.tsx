import {
  Button,
  ButtonVariant,
  ListItem,
  ButtonColor,
  SvgIcon,
} from '@altinn/altinn-design-system';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';

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
  contentColor: ListTextColor;
}

export const CompactDeletableListItem = ({
  removeCallback,
  leftText,
  middleText,
  startIcon,
  contentColor,
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
            <div className={classes.listItemIcon, classes.listItemIcon--{contentColor}}>
              <SvgIcon
                width={14}
                height={14}
                svgIconComponent={startIcon}
              ></SvgIcon>
            </div>
          )}
          <div className={classes.listItemTexts}>
            <div className={classes.firstText}>{leftText}</div>
            <div className={classes.secondText}>{middleText}</div>
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
