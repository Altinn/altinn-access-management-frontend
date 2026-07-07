import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DsBadge, DsTabs } from '@altinn/altinn-components';

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
  tabProps?: Partial<React.ComponentProps<typeof DsTabs.Tab>>;
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
    <DsTabs
      data-size='sm'
      value={chosenTab}
      onChange={setChosenTab}
    >
      <DsTabs.List className={classes.tabList}>
        <DsTabs.Tab
          {...tabProps}
          value='packages'
        >
          {tabBadge && (
            <DsBadge
              data-size='sm'
              color={chosenTab === 'packages' ? 'accent' : 'neutral'}
              count={tabBadge?.accessPackages ?? 0}
              maxCount={99}
            />
          )}
          <span className={classes.tabLabel}>
            <PackageIcon aria-hidden='true' />
            {t('user_rights_page.access_packages_title')}
          </span>
        </DsTabs.Tab>
        {singleRightsPanel && (
          <DsTabs.Tab
            {...tabProps}
            value='singleRights'
          >
            {tabBadge && (
              <DsBadge
                data-size='sm'
                color={chosenTab === 'singleRights' ? 'accent' : 'neutral'}
                count={tabBadge?.services ?? 0}
                maxCount={99}
              />
            )}
            <span className={classes.tabLabel}>
              <FilesIcon aria-hidden='true' />
              {t('user_rights_page.single_rights_title')}
            </span>
          </DsTabs.Tab>
        )}
        {instancesPanel && (
          <DsTabs.Tab
            {...tabProps}
            value='instances'
          >
            {tabBadge && (
              <DsBadge
                data-size='sm'
                color={chosenTab === 'instances' ? 'accent' : 'neutral'}
                count={tabBadge?.instances ?? 0}
                maxCount={99}
              />
            )}
            <span className={classes.tabLabel}>
              <EnvelopeClosedIcon aria-hidden='true' />
              {t('user_rights_page.instances_title')}
            </span>
          </DsTabs.Tab>
        )}
        {displayRoles && roleAssignmentsPanel && (
          <DsTabs.Tab
            {...tabProps}
            value='roleAssignments'
          >
            {tabBadge && (
              <DsBadge
                data-size='sm'
                color={chosenTab === 'roleAssignments' ? 'accent' : 'neutral'}
                count={tabBadge?.roles ?? 0}
                maxCount={99}
              />
            )}
            <span className={classes.tabLabel}>
              <FolderIcon aria-hidden='true' />
              {t('user_rights_page.roles_title')}
            </span>
          </DsTabs.Tab>
        )}
        {showGuardianshipsTab && (
          <DsTabs.Tab
            {...tabProps}
            value='guardianships'
          >
            {tabBadge && (
              <DsBadge
                data-size='sm'
                color={chosenTab === 'guardianships' ? 'accent' : 'neutral'}
                count={tabBadge?.guardianships ?? 0}
                maxCount={99}
              />
            )}
            <span className={classes.tabLabel}>
              <ShieldLockIcon aria-hidden='true' />
              {t('user_rights_page.guardianships_title')}
            </span>
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
      {instancesPanel && (
        <DsTabs.Panel
          className={classes.tabContent}
          value='instances'
        >
          <div className={classes.innerTabContent}>{instancesPanel}</div>
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
      {showGuardianshipsTab && (
        <DsTabs.Panel
          className={classes.tabContent}
          value='guardianships'
        >
          <div className={classes.innerTabContent}>{guardianshipsPanel}</div>
        </DsTabs.Panel>
      )}
    </DsTabs>
  );
};
