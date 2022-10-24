import { Button, ButtonVariant, ListItem } from '@altinn/altinn-design-system';
import cn from 'classnames';

import classes from './DeletableListItem.module.css';

export interface DeletableListItemProps {
  itemName: string;
  isSoftDelete: boolean;
  toggleDelState: () => void;
}

export const DeletableListItem = ({
  itemName,
  isSoftDelete,
  toggleDelState,
}: DeletableListItemProps) => {
  return (
    <ListItem>
      <div className={classes['deletable-list-item__listItem']}>
        <div
          className={cn(classes['deletable-list-item__itemText'], {
            [classes['deletable-list-item__itemText--soft-delete']]:
              isSoftDelete,
          })}
        >
          {itemName}
        </div>
        <div className={cn(classes['deletable-list-item__deleteSection'])}>
          {isSoftDelete ? (
            <Button variant={ButtonVariant.Secondary} onClick={toggleDelState}>
              Angre
            </Button>
          ) : (
            <Button variant={ButtonVariant.Cancel} onClick={toggleDelState}>
              Slett
            </Button>
          )}
        </div>
      </div>
    </ListItem>
  );
};
