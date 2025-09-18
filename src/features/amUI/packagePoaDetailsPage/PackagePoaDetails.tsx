import { useMemo, useState } from 'react';
import pageClasses from './PackagePoaDetailsPage.module.css';
import headerClasses from './PackagePoaDetailsHeader.module.css';
import { DsAlert, DsParagraph, DsSearch, DsTabs, Heading } from '@altinn/altinn-components';
import { Link, useParams } from 'react-router';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useGetPackagePermissionDetailsQuery } from '@/rtk/features/accessPackageApi';
import { useTranslation } from 'react-i18next';
import {
  PartyType,
  useGetRightHoldersQuery,
  type Connection,
  type User,
} from '@/rtk/features/userInfoApi';
import { PackagePoaDetailsHeader } from './PackagePoaDetailsHeader';
import { amUIPath } from '@/routes/paths/amUIPath';
import { ResourceList } from '../common/ResourceList/ResourceList';
import AdvancedUserSearch from '../common/AdvancedUserSearch/AdvancedUserSearch';
import { useAccessPackageActions } from '../common/AccessPackageList/useAccessPackageActions';
import { Party } from '@/rtk/features/lookupApi';

const mapUserToParty = (user: User): Party => ({
  partyId: 0,
  partyUuid: user.id,
  name: user.name,
  partyTypeName: user.variant === 'organization' ? PartyType.Organization : PartyType.Person,
});

export const PackagePoaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { fromParty } = usePartyRepresentation();

  const {
    data: accessPackage,
    isLoading,
    error,
  } = useGetPackagePermissionDetailsQuery(
    {
      from: fromParty?.partyUuid ?? '',
      packageId: id || '',
    },
    { skip: !id || !fromParty?.partyUuid },
  );

  const { data: indirectConnections, isLoading: loadingIndirectConnections } =
    useGetRightHoldersQuery(
      {
        partyUuid: fromParty?.partyUuid ?? '',
        fromUuid: fromParty?.partyUuid ?? '',
        toUuid: '', // all
      },
      {
        skip: !fromParty?.partyUuid,
      },
    );

  const connections: Connection[] = useMemo(() => {
    const group: Record<string, Connection> = {};
    for (const { to, role } of accessPackage?.permissions ?? []) {
      if (!group[to.id]) {
        const party: User = {
          id: to.id,
          name: to.name,
          type: to.type,
          variant: to.variant,
          children: null,
          keyValues: to.keyValues,
        };
        group[to.id] = { party, roles: [], connections: [] };
      }
      const entry = group[to.id];
      [role].forEach((r) => {
        if (r && !entry.roles.some((er) => er.code === r.code)) {
          entry.roles.push({ id: r.id, code: r.code });
        }
      });
    }
    return Object.values(group);
  }, [accessPackage?.permissions]);

  const [chosenTab, setChosenTab] = useState('users');

  // Show error alert with link back to overview if error fetching the Package
  if (error) {
    return (
      <DsAlert data-color='danger'>
        {t('package_poa_details_page.load_error')}{' '}
        <Link to={`/${amUIPath.PoaOverview}`}>
          {t('package_poa_details_page.back_to_overview_link')}
        </Link>
      </DsAlert>
    );
  }

  const { onDelegate, onRevoke, isLoading: isActionLoading } = useAccessPackageActions({});

  const handleOnDelegate = (user: User) => {
    const toParty = mapUserToParty(user);
    if (accessPackage && toParty) {
      onDelegate(accessPackage, toParty);
    }
  };

  const handleOnRevoke = (user: User) => {
    const toParty = mapUserToParty(user);
    if (accessPackage && toParty) {
      onRevoke(accessPackage, toParty);
    }
  };

  return (
    <>
      <div className={headerClasses.headingContainer}>
        <PackagePoaDetailsHeader
          isLoading={isLoading}
          packageName={accessPackage?.name}
          packageDescription={accessPackage?.description}
        />
      </div>
      <DsTabs
        defaultValue='users'
        data-size='sm'
        value={chosenTab}
        onChange={setChosenTab}
      >
        <DsTabs.List>
          <DsTabs.Tab value='users'>{t('package_poa_details_page.users_tab_title')}</DsTabs.Tab>
          <DsTabs.Tab value='services'>
            {t('package_poa_details_page.services_tab_title')}
          </DsTabs.Tab>
        </DsTabs.List>
        <DsTabs.Panel
          className={pageClasses.tabContent}
          value='users'
        >
          {connections.length === 0 && !isLoading ? (
            <DsParagraph
              data-size='md'
              className={pageClasses.tabDescription}
            >
              {t('package_poa_details_page.users_tab.no_users', {
                fromparty: fromParty?.name,
              })}
            </DsParagraph>
          ) : (
            <>
              {!isLoading && (
                <DsParagraph
                  data-size='md'
                  className={pageClasses.tabDescription}
                >
                  {t('package_poa_details_page.users_tab.description', {
                    fromparty: fromParty?.name,
                  })}
                </DsParagraph>
              )}
              <AdvancedUserSearch
                connections={connections}
                indirectConnections={indirectConnections}
                isLoading={isLoading || loadingIndirectConnections}
                onDelegate={handleOnDelegate}
                onRevoke={handleOnRevoke}
                isActionLoading={isActionLoading || isLoading || loadingIndirectConnections}
              />
            </>
          )}
        </DsTabs.Panel>
        <DsTabs.Panel
          className={pageClasses.tabContent}
          value='services'
        >
          <ResourceList
            isLoading={isLoading}
            resources={accessPackage?.resources ?? []}
            noResourcesText={t('package_poa_details_page.services_tab.no_resources')}
          />
        </DsTabs.Panel>
      </DsTabs>
    </>
  );
};
