// import { ListItemHeader } from '@altinn/altinn-components';

import { DsSkeleton } from '@altinn/altinn-components';

import classes from './UserPageHeader.module.css';

export const UserPageHeaderSkeleton = () => {
  return (
    <div className={classes.headingContainer}>
      <DsSkeleton
        width={40}
        height={40}
        className={classes.avatar}
      />
      <DsSkeleton
        width={400}
        height={40}
      />
      <DsSkeleton
        width={150}
        height={20}
        className={classes.subheading}
      />
    </div>
  );
};
