import pageClasses from './PackagePoaDetailsPage.module.css';
import headerClasses from './PackagePoaDetailsHeader.module.css';
import { DsAlert, DsTabs } from '@altinn/altinn-components';
import { Link, useParams, useSearchParams } from 'react-router';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useGetPackagePermissionDetailsQuery } from '@/rtk/features/accessPackageApi';
import { useTranslation } from 'react-i18next';
import { PackagePoaDetailsHeader } from './PackagePoaDetailsHeader';
import { ResourceList } from '../common/ResourceList/ResourceList';
import { UsersTab } from './UsersTab';
import { StatusSection } from '../common/StatusSection/StatusSection';
import { useAccessPackageDelegationCheck } from '../common/DelegationCheck/AccessPackageDelegationCheckContext';
import { isCriticalAndUndelegated } from '../common/AccessPackageList/UndelegatedPackageWarning';
import { FilesIcon, PersonGroupIcon } from '@navikt/aksel-icons';
import { amUIPath } from '@/routes/paths/amUIPath';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useTabState } from '@/resources/hooks';
import { RestoreFocusProvider, useRestoreFocus } from '../common/RestoreFocus';

export const PackagePoaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const { fromParty } = usePartyRepresentation();
  const { canDelegatePackage } = useAccessPackageDelegationCheck();
  // One zone for the whole page so the users tab can restore focus to the page heading (rendered in
  // the header, outside the tabs) after a revoke. The services tab only registers passive targets.
  const restoreFocus = useRestoreFocus();

  const {
    data: accessPackage,
    isLoading,
    isFetching,
    error,
  } = useGetPackagePermissionDetailsQuery(
    {
      from: fromParty?.partyUuid ?? '',
      packageId: id || '',
      language: i18n.language,
    },
    { skip: !id || !fromParty?.partyUuid },
  );

  useDocumentTitle(
    t('package_poa_details_page.page_title_access_package', {
      accessPackage: accessPackage?.name,
    }),
  );

  const [chosenTab, setChosenTab] = useTabState({
    tabs: ['users', 'services'],
    defaultTab: 'users',
  });
  const parentTab = searchParams.get('parentTab') ?? 'packages';
  const poaOverviewUrl = `/${amUIPath.PoaOverview}#${parentTab}`;

  const cannotDelegateHere = !!(accessPackage && accessPackage.isAssignable === false);
  const showUndelegatedWarning = !!(accessPackage && isCriticalAndUndelegated(accessPackage));
  const showDelegationCheckWarning =
    !!accessPackage && canDelegatePackage(accessPackage.id)?.result === false;

  // Show error alert with link back to overview if error fetching the Package
  if (error) {
    return (
      <DsAlert data-color='danger'>
        {t('package_poa_details_page.load_error')}{' '}
        <Link to={poaOverviewUrl}>{t('package_poa_details_page.back_to_overview_link')}</Link>
      </DsAlert>
    );
  }

  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <div className={headerClasses.headingContainer}>
        <PackagePoaDetailsHeader
          isLoading={isLoading}
          packageName={accessPackage?.name}
          packageDescription={accessPackage?.description}
          statusSection={
            <StatusSection
              cannotDelegateHere={cannotDelegateHere}
              showDelegationCheckWarning={showDelegationCheckWarning}
              showUndelegatedWarning={showUndelegatedWarning}
              undelegatedPackageName={accessPackage?.name}
            />
          }
        />
      </div>
      <DsTabs
        defaultValue='users'
        data-size='sm'
        value={chosenTab}
        onChange={setChosenTab}
      >
        <DsTabs.List>
          <DsTabs.Tab value='users'>
            <PersonGroupIcon aria-hidden='true' />
            {t('package_poa_details_page.users_tab_title')}
          </DsTabs.Tab>
          <DsTabs.Tab value='services'>
            <FilesIcon aria-hidden='true' />
            {t('package_poa_details_page.services_tab_title')}
          </DsTabs.Tab>
        </DsTabs.List>
        <DsTabs.Panel
          className={pageClasses.tabContent}
          value='users'
        >
          <div className={pageClasses.innerTabContent}>
            <UsersTab
              accessPackage={accessPackage}
              isLoading={isLoading}
              isFetching={isFetching}
            />
          </div>
        </DsTabs.Panel>
        <DsTabs.Panel
          className={pageClasses.tabContent}
          value='services'
        >
          <div className={pageClasses.innerTabContent}>
            <ResourceList
              isLoading={isLoading}
              resources={accessPackage?.resources ?? []}
              noResourcesText={t('package_poa_details_page.services_tab.no_resources')}
            />
          </div>
        </DsTabs.Panel>
      </DsTabs>
    </RestoreFocusProvider>
  );
};
