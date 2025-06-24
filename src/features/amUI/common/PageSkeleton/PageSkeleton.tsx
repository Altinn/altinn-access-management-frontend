import { DsSkeleton, Heading } from '@altinn/altinn-components';

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
      <Heading size='xl'>
        <DsSkeleton>xxxxx xxx xxxxxxxxxxxxx xxx xxxxxxxx</DsSkeleton>
      </Heading>
      <CurrentUserSkeleton />
      <Heading size='xl'>
        <DsSkeleton>xxxxx xxx xxxxxxxx</DsSkeleton>
      </Heading>
      <div className={classes.skeletonFilters}>
        <DsSkeleton>xxxxx xxx xxxxxxxx</DsSkeleton>
        <DsSkeleton>xxxxx xxx</DsSkeleton>
      </div>
      <SkeletonUserList />
    </div>
  );
};
