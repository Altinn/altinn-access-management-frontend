import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsBadge, DsTabs } from '@altinn/altinn-components';

import classes from './RightsTabs.module.css';
interface RightsTabsProps {
  tabBadge?: { accessPackages: number; services: number; roles: number };
  packagesPanel: ReactNode;
  singleRightsPanel: ReactNode;
  roleAssignmentsPanel: ReactNode;
}

export const RightsTabs = ({
  tabBadge,
  packagesPanel,
  singleRightsPanel,
  roleAssignmentsPanel,
}: RightsTabsProps) => {
  const { t } = useTranslation();
  const [chosenTab, setChosenTab] = useState('packages');

  const { displayLimitedPreviewLaunch, displayResourceDelegation } = window.featureFlags;

  return (
    <DsTabs
      defaultValue='packages'
      data-size='sm'
      value={chosenTab}
      onChange={setChosenTab}
    >
      <DsTabs.List>
        <DsTabs.Tab value='packages'>
          <DsBadge
            data-size='sm'
            color={chosenTab === 'packages' ? 'accent' : 'neutral'}
            count={tabBadge?.accessPackages ?? 0}
            maxCount={99}
          />
          {t('user_rights_page.access_packages_title')}
        </DsTabs.Tab>
        {displayResourceDelegation && (
          <DsTabs.Tab value='singleRights'>
            <DsBadge
              data-size='sm'
              color={chosenTab === 'singleRights' ? 'accent' : 'neutral'}
              count={tabBadge?.services ?? 0}
              maxCount={99}
            />
            {t('user_rights_page.single_rights_title')}
          </DsTabs.Tab>
        )}
        {displayLimitedPreviewLaunch && (
          <DsTabs.Tab value='roleAssignments'>
            <DsBadge
              data-size='sm'
              color={chosenTab === 'roleAssignments' ? 'accent' : 'neutral'}
              count={tabBadge?.roles ?? 0}
              maxCount={99}
            />
            {t('user_rights_page.roles_title')}
          </DsTabs.Tab>
        )}
      </DsTabs.List>
      <DsTabs.Panel
        className={classes.tabContent}
        value='packages'
      >
        {packagesPanel}
      </DsTabs.Panel>
      {displayResourceDelegation && (
        <DsTabs.Panel
          className={classes.tabContent}
          value='singleRights'
        >
          {singleRightsPanel}
        </DsTabs.Panel>
      )}
      {displayLimitedPreviewLaunch && (
        <DsTabs.Panel
          className={classes.tabContent}
          value='roleAssignments'
        >
          {roleAssignmentsPanel}
        </DsTabs.Panel>
      )}
    </DsTabs>
  );
};
