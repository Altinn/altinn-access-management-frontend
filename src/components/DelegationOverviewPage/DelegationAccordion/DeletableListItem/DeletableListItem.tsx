import { Button, ButtonVariant, ListItem } from '@altinn/altinn-design-system';
import cn from 'classnames';

import classes from './DeletableListItem.module.css';

export interface DeletableListItemProps {
  itemText: string;
  isSoftDelete: boolean;
  toggleDeleteState: () => void;
}

export const DeletableListItem = ({ itemText, isSoftDelete, toggleDeleteState }: DeletableListItemProps) => {
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
              onClick={toggleDeleteState}
            >
              Angre
            </Button>
          ) : (
            <Button
              variant={ButtonVariant.Cancel}
              onClick={toggleDeleteState}
            >
              Slett
            </Button>
          )}
        </div>
      </div>
    </ListItem>
  );
};
