import type { ListItemProps } from '@altinn/altinn-components';
import { ListItem } from '@altinn/altinn-components';

export const SkeletonUserList = () => {
  const userSkeletons = [
    {
      interactive: false,
      id: '2',
      size: 'lg',
      title: 'xxxxxxxx xxxxxxxxxx',
      avatar: {
        name: 'xxxxxxxx xxxxxxxxxx',
        type: 'person',
      },
    },
    {
      interactive: false,
      id: '3',
      size: 'lg',
      title: 'xx xxxxxxxx xxx xx',
      description: 'xxxxxxxxx',
      avatar: {
        name: 'xx xxxxxxxx xxx xx',
        type: 'company',
      },
    },
    {
      interactive: false,
      id: '4',
      size: 'lg',
      title: 'xxxxx xxxxxxxxx',
      avatar: {
        name: 'xxxxx xxxxxxxxx',
        type: 'person',
      },
    },
    {
      interactive: false,
      id: '4.5',
      size: 'lg',
      title: 'xxxxxxxx xxxxxxxx xxxxxx xx',
      description: 'xxxxxxxxx',
      avatar: {
        name: 'xxxxxxxx xxxxxxxx xxxxxx xx',
        type: 'company',
      },
    },
    {
      interactive: false,
      id: '5',
      size: 'lg',
      title: 'xxxxx xx xxxxxxx',
      description: 'xxxxxxxxx',
      avatar: {
        name: 'xxxxx xx xxxxxxx',
        type: 'company',
      },
    },
  ] as ListItemProps[];
  return (
    <>
      {userSkeletons.map((props: ListItemProps) => (
        <ListItem
          loading
          key={props.id}
          {...props}
        />
      ))}
    </>
  );
};
