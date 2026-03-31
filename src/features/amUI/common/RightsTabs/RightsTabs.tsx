import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
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
  value?: string;
  onChange?: (value: string) => void;
}

export const RightsTabs = ({
  tabBadge,
  packagesPanel,
  singleRightsPanel,
  instancesPanel,
  roleAssignmentsPanel,
  guardianshipsPanel,
  tabProps,
  value,
  onChange,
}: RightsTabsProps) => {
  const { t } = useTranslation();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [internalChosenTab, setInternalChosenTab] = useState('packages');

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
  // Support both URL-controlled tabs and the existing internal tab state.
  const chosenTab = value ?? internalChosenTab;
  const setChosenTab = onChange ?? setInternalChosenTab;
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

  useEffect(() => {
    if (hash) {
      const tab = hash.replace('#', '');
      if (tab === 'guardianships' && showGuardianshipsTab) {
        setChosenTab(tab);
        navigate('', { replace: true }); // clear hash fragment from URL after navigating to correct tab
      }
    }
  }, [hash, showGuardianshipsTab, navigate, setChosenTab]);

  useEffect(() => {
    if (!availableTabs.includes(chosenTab)) {
      setChosenTab('packages');
    }
  }, [availableTabs, chosenTab, setChosenTab]);

  return (
    <DsTabs
      data-size='sm'
      value={chosenTab}
      onChange={setChosenTab}
    >
      <DsTabs.List>
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
          <PackageIcon aria-hidden='true' />
          {t('user_rights_page.access_packages_title')}
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
            <FilesIcon aria-hidden='true' />
            {t('user_rights_page.single_rights_title')}
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
            <EnvelopeClosedIcon aria-hidden='true' />
            {t('user_rights_page.instances_title')}
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
            <FolderIcon aria-hidden='true' />
            {t('user_rights_page.roles_title')}
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
            <ShieldLockIcon aria-hidden='true' />
            {t('user_rights_page.guardianships_title')}
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
