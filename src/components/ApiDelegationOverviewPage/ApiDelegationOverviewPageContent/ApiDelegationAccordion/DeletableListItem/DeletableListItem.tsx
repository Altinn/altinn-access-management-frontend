import { Button, ButtonVariant, ListItem } from '@altinn/altinn-design-system';
import cn from 'classnames';

import classes from './DeletableListItem.module.css';

export interface DeletableListItemProps {
  itemText: string;
  isSoftDelete: boolean;
  toggleSoftDelete: () => void;
}

export const DeletableListItem = ({
  itemText,
  isSoftDelete,
  toggleSoftDelete,
}: DeletableListItemProps) => {
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
