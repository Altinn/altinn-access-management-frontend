import { useState } from 'react';
import pageClasses from './PackagePoaDetailsPage.module.css';
import headerClasses from './PackagePoaDetailsHeader.module.css';
import { DsAlert, DsTabs } from '@altinn/altinn-components';
import { Link, useParams } from 'react-router';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useGetPackagePermissionDetailsQuery } from '@/rtk/features/accessPackageApi';
import { useTranslation } from 'react-i18next';
import { PackagePoaDetailsHeader } from './PackagePoaDetailsHeader';
import { amUIPath } from '@/routes/paths/amUIPath';
import { ResourceList } from '../common/ResourceList/ResourceList';
import UsersTab from './UsersTab';

export const PackagePoaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { fromParty } = usePartyRepresentation();

  const {
    data: accessPackage,
    isLoading,
    isFetching,
    error,
  } = useGetPackagePermissionDetailsQuery(
    {
      from: fromParty?.partyUuid ?? '',
      packageId: id || '',
    },
    { skip: !id || !fromParty?.partyUuid },
  );

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
          <UsersTab
            accessPackage={accessPackage}
            fromParty={fromParty}
            isLoading={isLoading}
            isFetching={isFetching}
          />
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
