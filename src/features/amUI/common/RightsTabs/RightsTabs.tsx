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

  const { displayRoles } = window.featureFlags;

  return (
    <DsTabs
      defaultValue='packages'
      data-size='sm'
      value={chosenTab}
      onChange={setChosenTab}
    >
      <DsTabs.List>
        <DsTabs.Tab value='packages'>
          {tabBadge && (
            <DsBadge
              data-size='sm'
              color={chosenTab === 'packages' ? 'accent' : 'neutral'}
              count={tabBadge?.accessPackages ?? 0}
              maxCount={99}
            />
          )}
          {t('user_rights_page.access_packages_title')}
        </DsTabs.Tab>
        {singleRightsPanel && (
          <DsTabs.Tab value='singleRights'>
            {tabBadge && (
              <DsBadge
                data-size='sm'
                color={chosenTab === 'singleRights' ? 'accent' : 'neutral'}
                count={tabBadge?.services ?? 0}
                maxCount={99}
              />
            )}
            {t('user_rights_page.single_rights_title')}
          </DsTabs.Tab>
        )}
        {displayRoles && roleAssignmentsPanel && (
          <DsTabs.Tab value='roleAssignments'>
            {tabBadge && (
              <DsBadge
                data-size='sm'
                color={chosenTab === 'roleAssignments' ? 'accent' : 'neutral'}
                count={tabBadge?.roles ?? 0}
                maxCount={99}
              />
            )}
            {t('user_rights_page.roles_title')}
          </DsTabs.Tab>
        )}
      </DsTabs.List>
      <DsTabs.Panel
        className={classes.tabContent}
        value='packages'
      >
        <div className={classes.innerTabContent}>{packagesPanel}</div>
      </DsTabs.Panel>
      {singleRightsPanel && (
        <DsTabs.Panel
          className={classes.tabContent}
          value='singleRights'
        >
          <div className={classes.innerTabContent}>{singleRightsPanel}</div>
        </DsTabs.Panel>
      )}
      {displayRoles && roleAssignmentsPanel && (
        <DsTabs.Panel
          className={classes.tabContent}
          value='roleAssignments'
        >
          <div className={classes.innerTabContent}>{roleAssignmentsPanel}</div>
        </DsTabs.Panel>
      )}
    </DsTabs>
  );
};
