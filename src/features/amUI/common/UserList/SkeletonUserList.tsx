import type { ListItemProps } from '@altinn/altinn-components';
import { ListItem } from '@altinn/altinn-components';

export const SkeletonUserList = () => {
  const userSkeletons = [
    {
      id: '2',
      size: 'lg',
      title: 'TILGIVENDE BEGEISTRET',
      avatar: {
        name: 'TILGIVENDE BEGEISTRET',
        type: 'person',
      },
    },
    {
      id: '3',
      size: 'lg',
      title: 'RU MÅTEHOLDEN TIGER AS',
      description: '313175804',
      avatar: {
        name: 'RU MÅTEHOLDEN TIGER AS',
        type: 'company',
      },
    },
    {
      id: '4',
      size: 'lg',
      title: 'SKJØNN BJØRNUNGE',
      avatar: {
        name: 'SKJØNN BJØRNUNGE',
        type: 'person',
      },
    },
    {
      id: '4.5',
      size: 'lg',
      title: 'MOSEGRODD BARMHJERTIG TIGER AS',
      description: '312905604',
      avatar: {
        name: 'MOSEGRODD BARMHJERTIG TIGER AS',
        type: 'company',
      },
    },
    {
      id: '5',
      size: 'lg',
      title: 'TØRST RU APEKATT',
      description: '313175804',
      avatar: {
        name: 'TØRST RU APEKATT',
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
