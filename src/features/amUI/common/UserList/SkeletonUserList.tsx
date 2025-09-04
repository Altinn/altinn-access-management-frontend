import type { ListItemProps } from '@altinn/altinn-components';
import { ListItem } from '@altinn/altinn-components';

export const SkeletonUserList = () => {
  const userSkeletons = [
    {
      id: '2',
      size: 'md',
      title: 'xxxxxxxx xxxxxxxxxx',
      icon: {
        name: 'xxxxxxxx xxxxxxxxxx',
        type: 'person',
      },
    },
    {
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
      id: '4',
      size: 'md',
      title: 'xxxxx xxxxxxxxx',
      icon: {
        name: 'xxxxx xxxxxxxxx',
        type: 'person',
      },
    },
    {
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
          as='div'
          interactive={false}
          key={props.id}
          {...props}
        />
      ))}
    </>
  );
};
