import type { AccessAreaListItemProps } from '@altinn/altinn-components';
import { AccessAreaListItem, List } from '@altinn/altinn-components';

export const SkeletonAccessPackageList = () => {
  const areaSkeletons = [
    {
      id: '1',
      name: 'xxxxxxxx xxxxxxxxxx',
      iconUrl: 'xxx',
    },
    {
      id: '2',
      name: 'xxxxxxxx xxxxxxxxxx xxxx',
      iconUrl: 'xxx',
    },
  ] as AccessAreaListItemProps[];

  return (
    <List>
      {areaSkeletons.map(({ id, ...props }) => (
        <AccessAreaListItem
          as='div'
          interactive={false}
          loading
          key={id}
          id={id}
          badge='xxx'
          border='solid'
          size='lg'
          {...props}
        />
      ))}
    </List>
  );
};
