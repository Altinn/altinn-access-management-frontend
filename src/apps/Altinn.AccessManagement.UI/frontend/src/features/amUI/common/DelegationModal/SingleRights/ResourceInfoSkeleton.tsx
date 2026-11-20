import { DsSkeleton } from '@altinn/altinn-components';

import classes from './ResourceInfo.module.css';

export const ResourceInfoSkeleton = () => {
  return (
    <div
      className={classes.skeletonContainer}
      aria-hidden='true'
    >
      <div className={classes.resourceInfo}>
        <DsSkeleton
          height={16}
          width='100%'
        />
        <DsSkeleton
          height={16}
          width='72%'
        />
      </div>

      <div className={classes.skeletonRightsSection}>
        <DsSkeleton
          height={16}
          width='35%'
        />
        <DsSkeleton
          height={72}
          width='100%'
        />
      </div>

      <div className={classes.editButtons}>
        <DsSkeleton
          height={40}
          width='140px'
        />
      </div>
    </div>
  );
};
