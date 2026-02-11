import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DsBadge, DsTabs } from '@altinn/altinn-components';

import classes from './RightsTabs.module.css';
import { FilesIcon, FolderIcon, PackageIcon, ShieldLockIcon } from '@navikt/aksel-icons';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { useGetRolePermissionsQuery } from '@/rtk/features/roleApi';
import { useGroupedRoleListEntries } from '../RoleList/useGroupedRoleListEntries';
import { PartyType } from '@/rtk/features/userInfoApi';

interface RightsTabsProps {
  tabBadge?: { accessPackages: number; services: number; roles: number; guardianships: number };
  packagesPanel: ReactNode;
  singleRightsPanel: ReactNode;
  roleAssignmentsPanel: ReactNode;
  guardianshipsPanel?: ReactNode;
}

export const RightsTabs = ({
  tabBadge,
  packagesPanel,
  singleRightsPanel,
  roleAssignmentsPanel,
  guardianshipsPanel,
}: RightsTabsProps) => {
  const { t } = useTranslation();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [chosenTab, setChosenTab] = useState('packages');

  const { displayRoles } = window.featureFlags;
  const { toParty, fromParty, actingParty } = usePartyRepresentation();

  const { data: permissions } = useGetRolePermissionsQuery(
    {
      party: actingParty?.partyUuid ?? '',
      from: fromParty?.partyUuid,
      to: toParty?.partyUuid,
    },
    {
      skip: !actingParty?.partyUuid || !fromParty?.partyUuid || !toParty?.partyUuid,
    },
  );

  const { guardianshipRoles } = useGroupedRoleListEntries({
    permissions,
  });
  const showGuardianshipsTab =
    guardianshipsPanel &&
    fromParty?.partyTypeName === PartyType.Person &&
    (guardianshipRoles.length > 0 || !toParty);

  useEffect(() => {
    if (hash) {
      const tab = hash.replace('#', '');
      if (tab === 'guardianships' && showGuardianshipsTab) {
        setChosenTab(tab);
        navigate('', { replace: true }); // clear hash fragment from URL after navigating to correct tab
      }
    }
  }, [hash]);

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
          <PackageIcon aria-hidden='true' />
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
            <FilesIcon aria-hidden='true' />
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
            <FolderIcon aria-hidden='true' />
            {t('user_rights_page.roles_title')}
          </DsTabs.Tab>
        )}
        {/* Bruk <EnvelopeClosedIcon aria-hidden='true' /> for delt fra innboks tab*/}
        {showGuardianshipsTab && (
          <DsTabs.Tab value='guardianships'>
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
      {displayRoles && roleAssignmentsPanel && (
        <DsTabs.Panel
          className={classes.tabContent}
          value='roleAssignments'
        >
          <div className={classes.innerTabContent}>{roleAssignmentsPanel}</div>
        </DsTabs.Panel>
      )}
      {guardianshipsPanel && (
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
