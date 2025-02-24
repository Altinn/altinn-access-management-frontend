import type { AccessAreaListItemProps } from '@altinn/altinn-components';
import { AccessAreaListItem, ListBase } from '@altinn/altinn-components';

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
    <ListBase>
      {areaSkeletons.map(({ id, ...props }) => (
        <AccessAreaListItem
          loading
          key={id}
          id={id}
          badgeText='xxx'
          {...props}
        />
      ))}
    </ListBase>
  );
};
