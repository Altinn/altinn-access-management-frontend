import { Button, ButtonVariant, ListItem, ButtonColor } from '@digdir/design-system-react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import * as React from 'react';

import type { ApiListItem } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';
import { ReactComponent as Cancel } from '@/assets/Cancel.svg';
import { useMediaQuery } from '@/resources/hooks';

import classes from './DeletableListItem.module.css';

export interface DeletableListItemProps {
  softDeleteCallback: () => void;
  softRestoreCallback: () => void;
  item: ApiListItem;
  isEditable: boolean;
}

export const DeletableListItem = ({
  softDeleteCallback,
  softRestoreCallback,
  item,
  isEditable,
}: DeletableListItemProps) => {
  const { t } = useTranslation('common');
  const isSm = useMediaQuery('(max-width: 768px)');

  const isEditableActions = (
    <div className={cn(classes.deleteSection)}>
      {item.isSoftDelete ? (
        <Button
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Secondary}
          onClick={softRestoreCallback}
          icon={<Cancel />}
        >
          {!isSm && t('api_delegation.undo')}
        </Button>
      ) : (
        <Button
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Danger}
          icon={<MinusCircle />}
          onClick={softDeleteCallback}
        >
          {!isSm && t('api_delegation.delete')}
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
            <div className={classes.apiListItem}>{item.apiName}</div>
            <div className={classes.ownerListItem}>{item.owner}</div>
            <div>{item.description}</div>
          </div>
        </div>
        {isEditable && isEditableActions}
      </div>
    </ListItem>
  );
};
