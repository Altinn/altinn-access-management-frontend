import { DsSkeleton } from '@altinn/altinn-components';

import { SkeletonResourceList } from '../../common/ResourceList/SkeletonResourceList';

import classes from './SingleRightsSection.module.css';

export const SingleRightsSectionSkeleton = () => {
  return (
    <div className={classes.singleRightsSectionContainer}>
      <DsSkeleton
        width='40%'
        height='32px'
        className={classes.headingSkeleton}
      />
      <div className={classes.singleRightsList}>
        <SkeletonResourceList />
      </div>
    </div>
  );
};
