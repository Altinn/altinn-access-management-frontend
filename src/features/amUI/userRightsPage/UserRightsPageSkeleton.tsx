import { DsSkeleton, DsTabs } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { amUIPath } from '@/routes/paths';
import { UserPageHeaderSkeleton } from '../common/UserPageHeader/UserPageHeaderSkeleton';
import { SkeletonAccessPackageList } from '../common/AccessPackageList/SkeletonAccessPackageList';

import classes from '../common/RightsTabs/RightsTabs.module.css';

export const UserRightsPageSkeleton = () => {
  const { t } = useTranslation();
  const { displayLimitedPreviewLaunch, displayResourceDelegation } = window.featureFlags;

  return (
    <PageContainer backUrl={`/${amUIPath.Users}`}>
      <UserPageHeaderSkeleton />
      <DsTabs
        defaultValue='packages'
        data-size='sm'
      >
        <DsTabs.List>
          <DsTabs.Tab value='packages'>{t('user_rights_page.access_packages_title')}</DsTabs.Tab>
          {displayResourceDelegation && (
            <DsTabs.Tab value='singleRights'>
              {t('user_rights_page.single_rights_title')}
            </DsTabs.Tab>
          )}
          {!displayLimitedPreviewLaunch && (
            <DsTabs.Tab value='roleAssignments'>{t('user_rights_page.roles_title')}</DsTabs.Tab>
          )}
        </DsTabs.List>
        <DsTabs.Panel
          className={classes.tabContent}
          value='packages'
        >
          <SkeletonAccessPackageList />
        </DsTabs.Panel>
        {displayResourceDelegation && (
          <DsTabs.Panel
            className={classes.tabContent}
            value='singleRights'
          >
            <SkeletonAccessPackageList />
          </DsTabs.Panel>
        )}
        {!displayLimitedPreviewLaunch && (
          <DsTabs.Panel
            className={classes.tabContent}
            value='roleAssignments'
          >
            <SkeletonAccessPackageList />
          </DsTabs.Panel>
        )}
      </DsTabs>
    </PageContainer>
  );
};
