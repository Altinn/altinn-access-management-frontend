import { BorderedList as BorderedListRoot } from './BorderedList';
import { BorderedListItem } from './BorderedListItem/BorderedListItem';

export type { BorderedListProps } from './BorderedList';
export type { BorderedListItemProps } from './BorderedListItem/BorderedListItem';

type BorderedListComponent = typeof BorderedListRoot & {
  Item: typeof BorderedListItem;
};

const BorderedList = BorderedListRoot as BorderedListComponent;

BorderedList.Item = BorderedListItem;

export { BorderedList, BorderedListItem };
