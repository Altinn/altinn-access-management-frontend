import { Button, ButtonVariant, ListItem, ButtonColor } from '@altinn/altinn-design-system';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import type { ApiListItem } from '@/rtk/features/overviewOrg/overviewOrgSlice';
import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';
import { ReactComponent as Cancel } from '@/assets/Cancel.svg';

import classes from './DeletableListItem.module.css';

export interface DeletableListItemProps {
  softDeleteCallback: () => void;
  softUndeleteCallback: () => void;
  item: ApiListItem;
  isEditable: boolean;
}

export const DeletableListItem = ({
  softDeleteCallback,
  softUndeleteCallback,
  item,
  isEditable,
}: DeletableListItemProps) => {
  const { t } = useTranslation('common');

  const isEditableActions = (
    <div className={cn(classes.deleteSection)}>
      {item.isSoftDelete ? (
        <Button
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Secondary}
          onClick={softUndeleteCallback}
          svgIconComponent={<Cancel />}
        >
          {t('api_delegation.undelete')}
        </Button>
      ) : (
        <Button
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Danger}
          svgIconComponent={<MinusCircle />}
          onClick={softDeleteCallback}
        >
          {t('api_delegation.delete')}
        </Button>
      )}
    </div>
  );

  return (
    <ListItem>
      <div className={classes.listItem}>
        <div
          data-testid='list-item-texts'
          className={cn(classes.itemText, {
            [classes.itemText__softDelete]: item.isSoftDelete,
          })}
        >
          <div className={classes.listItemTexts}>
            <div>{item.name}</div>
            <div>{item.owner}</div>
            <div>{item.description}</div>
          </div>
        </div>
        {isEditable && isEditableActions}
      </div>
    </ListItem>
  );
};
