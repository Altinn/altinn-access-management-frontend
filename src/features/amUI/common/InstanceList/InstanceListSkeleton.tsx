import { DialogListItem, List, type DialogListItemProps } from '@altinn/altinn-components';

export const InstanceListSkeleton = () => {
  return (
    <List>
      {Array.from({ length: 3 }, (_, index) => {
        const item: DialogListItemProps = {
          id: `instance-loading-${index}`,
          title: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
          description: 'xxxxxxxxx',
          sender: {
            name: 'xxxxxxxxx',
            type: 'company',
          },
          updatedAt: 'xxxxxxxxxx',
          updatedAtLabel: 'xxxxxxxxxx',
        };

        return (
          <DialogListItem
            key={item.id}
            size='md'
            loading={true}
            {...item}
          />
        );
      })}
    </List>
  );
};
