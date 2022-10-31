import { Button, ButtonVariant, ListItem } from '@altinn/altinn-design-system';
import cn from 'classnames';

import classes from './DeletableListItem.module.css';

export interface DeletableListItemProps {
  itemText: string;
  isSoftDelete: boolean;
  toggleSoftDelete: () => void;
}

export const DeletableListItem = ({ itemText, isSoftDelete, toggleSoftDelete }: DeletableListItemProps) => {
  return (
    <ListItem>
      <div className={classes['deletable-list-item__listItem']}>
        <div
          className={cn(classes['deletable-list-item__itemText'], {
            [classes['deletable-list-item__itemText--soft-delete']]: isSoftDelete,
          })}
        >
          {itemText}
        </div>
        <div className={cn(classes['deletable-list-item__deleteSection'])}>
          {isSoftDelete ? (
            <Button
              variant={ButtonVariant.Secondary}
              onClick={toggleSoftDelete}
            >
              Angre
            </Button>
          ) : (
            <Button
              variant={ButtonVariant.Cancel}
              onClick={toggleSoftDelete}
            >
              Slett
            </Button>
          )}
        </div>
      </div>
    </ListItem>
  );
};
