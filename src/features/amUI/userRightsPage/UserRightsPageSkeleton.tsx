import { DsSkeleton, DsTabs } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { amUIPath } from '@/routes/paths';
import { UserPageHeaderSkeleton } from '../common/UserPageHeader/UserPageHeaderSkeleton';
import { SkeletonAccessPackageList } from '../common/AccessPackageList/SkeletonAccessPackageList';

import classes from '../common/RightsTabs/RightsTabs.module.css';
import { TabContentSkeleton } from '../common/RightsTabs/TabContentSkeleton';

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
