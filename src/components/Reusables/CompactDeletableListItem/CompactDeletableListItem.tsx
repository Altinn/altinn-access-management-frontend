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

export interface CompactDeletableListItemProps {
  removeCallback?: (() => void) | null;
  leftText: string;
  middleText: string;
  icon?: React.ReactNode;
}

export const CompactDeletableListItem = ({
  removeCallback,
  leftText,
  middleText,
  icon,
}: CompactDeletableListItemProps) => {
  const { t } = useTranslation('common');

  return (
    <ListItem>
      <div
        className={classes.compactListItem}
        data-testid='compact-list-item'
      >
        <div className={classes.baseListItemContent}>
          {icon && (
            <div className={classes.listItemIcon}>
              <SvgIcon
                width={14}
                height={14}
                svgIconComponent={icon}
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
