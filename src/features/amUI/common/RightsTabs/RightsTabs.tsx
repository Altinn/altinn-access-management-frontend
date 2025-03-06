import { Badge, Tabs } from '@digdir/designsystemet-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

  const displaySingleRights = window.featureFlags?.displayResourceDelegation === true;
  return (
    <Tabs
      defaultValue='packages'
      data-size='sm'
      value={chosenTab}
      onChange={setChosenTab}
    >
      <Tabs.List>
        <Tabs.Tab value='packages'>
          <Badge
            data-size='sm'
            color={chosenTab === 'packages' ? 'accent' : 'neutral'}
            count={tabBadge?.accessPackages ?? 0}
            maxCount={99}
          />
          {t('user_rights_page.access_packages_title')}
        </Tabs.Tab>
        {displaySingleRights && (
          <Tabs.Tab value='singleRights'>
            <Badge
              size='sm'
              color={chosenTab === 'singleRights' ? 'accent' : 'neutral'}
              count={tabBadge?.services ?? 0}
              maxCount={99}
            />
            {t('user_rights_page.single_rights_title')}
          </Tabs.Tab>
        )}
        <Tabs.Tab value='roleAssignments'>
          <Badge
            data-size='sm'
            color={chosenTab === 'roleAssignments' ? 'accent' : 'neutral'}
            count={tabBadge?.roles ?? 0}
            maxCount={99}
          />
          {t('user_rights_page.roles_title')}
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value='packages'>{packagesPanel}</Tabs.Panel>
      {displaySingleRights && <Tabs.Panel value='singleRights'>{singleRightsPanel}</Tabs.Panel>}
      <Tabs.Panel value='roleAssignments'>{roleAssignmentsPanel}</Tabs.Panel>
    </Tabs>
  );
};
