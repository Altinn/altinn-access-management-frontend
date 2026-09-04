import { PageContainer } from '../common/PageContainer/PageContainer';
import { UserPageHeaderSkeleton } from '../common/UserPageHeader/UserPageHeaderSkeleton';
import classes from '../common/RightsTabs/RightsTabs.module.css';
import { TabContentSkeleton } from '../common/RightsTabs/TabContentSkeleton';

import { amUIPath } from '@/routes/paths';

export const UserRightsPageSkeleton = () => {
  return (
    <PageContainer backUrl={`/${amUIPath.Users}`}>
      <UserPageHeaderSkeleton />
      <div className={classes.tabContent}>
        <TabContentSkeleton />
      </div>
    </PageContainer>
  );
};
