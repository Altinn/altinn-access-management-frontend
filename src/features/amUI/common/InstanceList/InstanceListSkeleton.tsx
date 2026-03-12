import { DialogListItem, List, type DialogListItemProps } from '@altinn/altinn-components';

const createLoadingListItem = (index: number): DialogListItemProps => ({
  id: `instance-loading-${index}`,
  title: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
  description: 'xxxxxxxxx',
  sender: {
    name: 'xxxxxxxxx',
    type: 'company',
  },
  updatedAt: 'xxxxxxxxxx',
  updatedAtLabel: 'xxxxxxxxxx',
});

export const InstanceListSkeleton = () => {
  return (
    <List>
      {Array.from({ length: 3 }, (_, index) => {
        const item = createLoadingListItem(index);

        return (
          <DialogListItem
            key={item.id}
            size='lg'
            loading={true}
            {...item}
          />
        );
      })}
    </List>
  );
};
