import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import classes from './RightsTabs.module.css';
import {
  EnvelopeClosedIcon,
  FilesIcon,
  FolderIcon,
  PackageIcon,
  ShieldLockIcon,
} from '@navikt/aksel-icons';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { PartyType } from '@/rtk/features/userInfoApi';
import { useGetUserDelegationsQuery } from '@/rtk/features/accessPackageApi';
import { isGuardianshipUrn } from '@/resources/utils';
import { useTabState } from '@/resources/hooks';
import { AmTabs } from '../AmTabs/AmTabs';

interface RightsTabsProps {
  tabBadge?: {
    accessPackages: number;
    services: number;
    instances?: number;
    roles: number;
    guardianships: number;
  };
  packagesPanel: ReactNode;
  singleRightsPanel: ReactNode;
  instancesPanel?: ReactNode;
  roleAssignmentsPanel: ReactNode;
  guardianshipsPanel?: ReactNode;
  tabProps?: Partial<React.ComponentProps<typeof AmTabs.Tab>>;
}

export const RightsTabs = ({
  tabBadge,
  packagesPanel,
  singleRightsPanel,
  instancesPanel,
  roleAssignmentsPanel,
  guardianshipsPanel,
  tabProps,
}: RightsTabsProps) => {
  const { t } = useTranslation();

  const { displayRoles } = window.featureFlags;
  const { toParty, fromParty, actingParty } = usePartyRepresentation();

  const { data: activeDelegations } = useGetUserDelegationsQuery(
    {
      from: fromParty?.partyUuid ?? '',
      to: toParty?.partyUuid ?? '',
      party: actingParty?.partyUuid ?? '',
    },
    {
      skip: (!toParty?.partyUuid && !fromParty?.partyUuid) || !actingParty?.partyUuid,
    },
  );

  const hasGuardianPermission = Object.values(activeDelegations ?? {})
    .flat()
    .filter((item) => isGuardianshipUrn(item.package.urn))
    .some((item) => item.permissions.some((perm) => perm.from.id === fromParty?.partyUuid));

  const showGuardianshipsTab =
    guardianshipsPanel && fromParty?.partyTypeName === PartyType.Person && hasGuardianPermission;
  const availableTabs = useMemo(
    () => [
      'packages',
      ...(singleRightsPanel ? ['singleRights'] : []),
      ...(instancesPanel ? ['instances'] : []),
      ...(displayRoles && roleAssignmentsPanel ? ['roleAssignments'] : []),
      ...(showGuardianshipsTab ? ['guardianships'] : []),
    ],
    [singleRightsPanel, instancesPanel, displayRoles, roleAssignmentsPanel, showGuardianshipsTab],
  );

  const [chosenTab, setChosenTab] = useTabState({ tabs: availableTabs, defaultTab: 'packages' });

  return (
    <AmTabs
      value={chosenTab}
      onChange={setChosenTab}
    >
      <AmTabs.List>
        <AmTabs.Tab
          {...tabProps}
          value='packages'
          label={t('user_rights_page.access_packages_title')}
          icon={<PackageIcon aria-hidden='true' />}
          badge={tabBadge?.accessPackages}
        />
        {singleRightsPanel && (
          <AmTabs.Tab
            {...tabProps}
            value='singleRights'
            label={t('user_rights_page.single_rights_title')}
            icon={<FilesIcon aria-hidden='true' />}
            badge={tabBadge?.services}
          />
        )}
        {instancesPanel && (
          <AmTabs.Tab
            {...tabProps}
            value='instances'
            label={t('user_rights_page.instances_title')}
            icon={<EnvelopeClosedIcon aria-hidden='true' />}
            badge={tabBadge?.instances}
          />
        )}
        {displayRoles && roleAssignmentsPanel && (
          <AmTabs.Tab
            {...tabProps}
            value='roleAssignments'
            label={t('user_rights_page.roles_title')}
            icon={<FolderIcon aria-hidden='true' />}
            badge={tabBadge?.roles}
          />
        )}
        {showGuardianshipsTab && (
          <AmTabs.Tab
            {...tabProps}
            value='guardianships'
            label={t('user_rights_page.guardianships_title')}
            icon={<ShieldLockIcon aria-hidden='true' />}
            badge={tabBadge?.guardianships}
          />
        )}
      </AmTabs.List>
      <AmTabs.Panel
        className={classes.tabContent}
        value='packages'
      >
        <div className={classes.innerTabContent}>{packagesPanel}</div>
      </AmTabs.Panel>
      {singleRightsPanel && (
        <AmTabs.Panel
          className={classes.tabContent}
          value='singleRights'
        >
          <div className={classes.innerTabContent}>{singleRightsPanel}</div>
        </AmTabs.Panel>
      )}
      {instancesPanel && (
        <AmTabs.Panel
          className={classes.tabContent}
          value='instances'
        >
          <div className={classes.innerTabContent}>{instancesPanel}</div>
        </AmTabs.Panel>
      )}
      {displayRoles && roleAssignmentsPanel && (
        <AmTabs.Panel
          className={classes.tabContent}
          value='roleAssignments'
        >
          <div className={classes.innerTabContent}>{roleAssignmentsPanel}</div>
        </AmTabs.Panel>
      )}
      {showGuardianshipsTab && (
        <AmTabs.Panel
          className={classes.tabContent}
          value='guardianships'
        >
          <div className={classes.innerTabContent}>{guardianshipsPanel}</div>
        </AmTabs.Panel>
      )}
    </AmTabs>
  );
};
