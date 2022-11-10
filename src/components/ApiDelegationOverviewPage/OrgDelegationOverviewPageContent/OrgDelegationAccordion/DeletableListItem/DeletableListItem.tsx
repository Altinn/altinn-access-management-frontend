import { Button, ButtonVariant, ListItem, ButtonColor } from '@altinn/altinn-design-system';
import cn from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import classes from './DeletableListItem.module.css';

export interface DeletableListItemProps {
  itemText: string;
  isSoftDelete: boolean;
  toggleSoftDeleteCallback: () => {};
}

export const DeletableListItem = ({
  itemText,
  isSoftDelete,
  toggleSoftDeleteCallback,
}: DeletableListItemProps) => {
  const { t } = useTranslation('common');

  return (
    <ListItem>
      <div className={classes.listItem}>
        <div
          className={cn(classes.itemText, {
            [classes.itemText__softDelete]: isSoftDelete,
          })}
        >
          {itemText}
        </div>
        <div className={cn(classes.deleteSection)}>
          {isSoftDelete ? (
            <Button
              variant={ButtonVariant.Quiet}
              color={ButtonColor.Secondary}
              onClick={toggleSoftDeleteCallback}
              iconName='Cancel'
            >
              Angre
            </Button>
          ) : (
            <Button
              variant={ButtonVariant.Quiet}
              color={ButtonColor.Danger}
              iconName={'MinusCircle'}
              onClick={toggleSoftDeleteCallback}
            >
              {t('api_delegation.delete')}
            </Button>
          )}
        </div>
      </div>
    </ListItem>
  );
};
