import {
  Button,
  ButtonVariant,
  ListItem,
  ButtonColor,
  SvgIcon,
} from '@altinn/altinn-design-system';
import { useTranslation } from 'react-i18next';

import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';

import classes from './CompactDeletableListItem.module.css';

export interface DeletableListItemProps {
  removeCallback?: (() => void) | null;
  firstText: string;
  secondText: string;
  startIcon?: React.ReactNode;
}

export const CompactDeletableListItem = ({
  removeCallback,
  firstText,
  secondText,
  startIcon,
}: DeletableListItemProps) => {
  const { t } = useTranslation('common');

  return (
    <ListItem>
      <div
        className={classes.compactListItem}
        data-testid='compact-list-item'
      >
        <div className={classes.baseListItemContent}>
          {startIcon && (
            <div className={classes.listItemIcon}>
              <SvgIcon
                width={14}
                height={14}
                svgIconComponent={startIcon}
              ></SvgIcon>
            </div>
          )}
          <div className={classes.listItemTexts}>
            <div className={classes.firstText}>{firstText}</div>
            <div className={classes.secondText}>{secondText}</div>
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
