// import { ListItemHeader } from '@altinn/altinn-components';

import { DsSkeleton } from '@altinn/altinn-components';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';

import classes from './UserPageHeader.module.css';

export const UserPageHeaderSkeleton = () => {
  const isSmallScreen = useIsTabletOrSmaller();
  return (
    <div className={classes.headingContainer}>
      <DsSkeleton
        width={40}
        height={40}
        className={classes.avatar}
      />
      <DsSkeleton
        width={isSmallScreen ? 200 : 400}
        height={40}
      />
      <DsSkeleton
        width={isSmallScreen ? 100 : 150}
        height={20}
        className={classes.subheading}
      />
    </div>
  );
};
