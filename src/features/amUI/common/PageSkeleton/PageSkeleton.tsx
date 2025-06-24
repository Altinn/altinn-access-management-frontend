import { DsHeading, DsSkeleton } from '@altinn/altinn-components';

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
      <DsHeading data-size='lg'>
        <DsSkeleton>xxxxx xxx xxxxxxxxxxxxx xxx xxxxxxxx</DsSkeleton>
      </DsHeading>
      <div className={classes.skeletonHeader}>
        <CurrentUserSkeleton />
      </div>
      <DsHeading data-size='sm'>
        <DsSkeleton>xxxxx xxx xxxxxxxx</DsSkeleton>
      </DsHeading>
      <DsHeading data-size='md'>
        <div className={classes.skeletonFilters}>
          <DsSkeleton>xxxxx xxx xxxxxxxx</DsSkeleton>
          <DsSkeleton>xxxxx xxx</DsSkeleton>
        </div>
      </DsHeading>
      <SkeletonUserList />
    </div>
  );
};
