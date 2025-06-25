import { DsSkeleton } from '@altinn/altinn-components';

import { PageContainer } from '../PageContainer/PageContainer';
import { UserPageHeaderSkeleton } from '../UserPageHeader/UserPageHeaderSkeleton';
import { SkeletonUserList } from '../UserList/SkeletonUserList';
import { CurrentUserSkeleton } from '../CurrentUserPageHeader/CurrentUserSkeleton';
import { RightsTabsSkeleton } from '../RightsTabs/RightsTabsSkeleton';

import classes from './PageSkeleton.module.css';

export const PageSkeleton = ({ template }: { template: 'listPage' | 'detailsPage' }) => {
  if (template === 'detailsPage') {
    return (
      <PageContainer>
        <div className={classes.skeletonContainer}>
          <UserPageHeaderSkeleton />
          <RightsTabsSkeleton />
        </div>
      </PageContainer>
    );
  }
  return (
    <div className={classes.skeletonContainer}>
      <DsSkeleton
        width={400}
        height={40}
      />
      <div className={classes.skeletonHeader}>
        <CurrentUserSkeleton />
      </div>
      <DsSkeleton
        width={150}
        height={30}
      />
      <div className={classes.skeletonFilters}>
        <DsSkeleton
          width={200}
          height={40}
        />
        <DsSkeleton
          width={100}
          height={40}
        />
      </div>
      <SkeletonUserList />
    </div>
  );
};
