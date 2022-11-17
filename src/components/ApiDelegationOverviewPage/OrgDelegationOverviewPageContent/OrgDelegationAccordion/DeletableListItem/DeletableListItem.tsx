import { Button, ButtonVariant, ListItem, ButtonColor } from '@altinn/altinn-design-system';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import type { OverviewListItem, OverviewOrg } from '@/rtk/features/overviewOrg/overviewOrgSlice';
import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';
import { ReactComponent as Cancel } from '@/assets/Cancel.svg';

import classes from './DeletableListItem.module.css';

export interface DeletableListItemProps {
  softDeleteCallback: (overviewOrg: OverviewOrg, item: OverviewListItem) => {};
  softAddCallback: (overviewOrg: OverviewOrg, item: OverviewListItem) => {};
  overviewOrg: OverviewOrg;
  item: OverviewListItem;
}

export const DeletableListItem = ({
  softDeleteCallback,
  softAddCallback,
  overviewOrg,
  item,
}: DeletableListItemProps) => {
  const { t } = useTranslation('common');

  const handleSoftDelete = (overviewOrg: OverviewOrg, item: OverviewListItem) => {
    softDeleteCallback(overviewOrg, item);
  };
  const handleSoftAdd = (overviewOrg: OverviewOrg, item: OverviewListItem) => {
    softAddCallback(overviewOrg, item);
  };

  return (
    <ListItem>
      <div className={classes.listItem}>
        <div
          className={cn(classes.itemText, {
            [classes.itemText__softDelete]: item.isSoftDelete,
          })}
        >
          {item.name}
        </div>
        <div className={cn(classes.deleteSection)}>
          {item.isSoftDelete ? (
            <Button
              variant={ButtonVariant.Quiet}
              color={ButtonColor.Secondary}
              onClick={() => handleSoftAdd(overviewOrg, item)}
              svgIconComponent={<Cancel />}
            >
              {t('api_delegation.undo')}
            </Button>
          ) : (
            <Button
              variant={ButtonVariant.Quiet}
              color={ButtonColor.Danger}
              svgIconComponent={<MinusCircle />}
              onClick={() => handleSoftDelete(overviewOrg, item)}
            >
              {t('api_delegation.delete')}
            </Button>
          )}
        </div>
      </div>
    </ListItem>
  );
};
