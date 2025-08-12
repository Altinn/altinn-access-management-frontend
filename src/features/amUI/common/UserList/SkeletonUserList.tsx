import type { ListItemProps } from '@altinn/altinn-components';
import { ListItem } from '@altinn/altinn-components';

export const SkeletonUserList = () => {
  const userSkeletons = [
    {
      interactive: false,
      id: '2',
      size: 'md',
      title: 'xxxxxxxx xxxxxxxxxx',
      icon: {
        name: 'xxxxxxxx xxxxxxxxxx',
        type: 'person',
      },
    },
    {
      interactive: false,
      id: '3',
      size: 'md',
      title: 'xx xxxxxxxx xxx xx',
      description: 'xxxxxxxxx',
      icon: {
        name: 'xx xxxxxxxx xxx xx',
        type: 'company',
      },
    },
    {
      interactive: false,
      id: '4',
      size: 'md',
      title: 'xxxxx xxxxxxxxx',
      icon: {
        name: 'xxxxx xxxxxxxxx',
        type: 'person',
      },
    },
    {
      interactive: false,
      id: '4.5',
      size: 'md',
      title: 'xxxxxxxx xxxxxxxx xxxxxx xx',
      description: 'xxxxxxxxx',
      icon: {
        name: 'xxxxxxxx xxxxxxxx xxxxxx xx',
        type: 'company',
      },
    },
    {
      interactive: false,
      id: '5',
      size: 'md',
      title: 'xxxxx xx xxxxxxx',
      description: 'xxxxxxxxx',
      icon: {
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
