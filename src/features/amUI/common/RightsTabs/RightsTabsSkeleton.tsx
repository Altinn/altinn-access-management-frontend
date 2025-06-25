import type { ListItemProps } from '@altinn/altinn-components';
import { DsSkeleton, List } from '@altinn/altinn-components';

import classes from './RightsTabs.module.css';

const skeletonListItems = [
  {
    id: '1',
    size: 'md',
    loading: true,
    title: 'xxx xxxx xxxxx',
    icon: { iconUrl: '...', type: 'company' },
    interactive: false,
  },
  {
    id: '2',
    size: 'md',
    loading: true,
    title: 'xxx xxxx xxxxx xxxx xxxxx',
    icon: { iconUrl: '...', type: 'company' },
    interactive: false,
  },
  {
    id: '3',
    size: 'md',
    loading: true,
    title: 'xxx xxxxx',
    icon: { iconUrl: '...', type: 'company' },
    interactive: false,
  },
] as ListItemProps[];

export const RightsTabsSkeleton = () => {
  return (
    <div className={classes.skeletonContainer}>
      <div className={classes.skeletonTabs}>
        <DsSkeleton
          width={200}
          height={30}
        />
        <DsSkeleton
          width={100}
          height={30}
        />
        <DsSkeleton
          width={150}
          height={30}
        />
      </div>
      <DsSkeleton
        width={200}
        height={40}
      />
      <div>
        <List items={skeletonListItems} />
      </div>
    </div>
  );
};
