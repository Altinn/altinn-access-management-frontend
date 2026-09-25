import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DsAlert } from '@altinn/altinn-components';

import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useGetResourceQuery } from '@/rtk/features/resourceApi';
import { amUIPath } from '@/routes/paths/amUIPath';

import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { PageDivider } from '../common/PageDivider/PageDivider';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { RestoreFocusProvider, useRestoreFocus } from '../common/RestoreFocus';

import { ServicePoaDetailsHeader } from './ServicePoaDetailsHeader';
import { ServiceUsersSection } from './ServiceUsersSection';
import classes from './ServicePoaDetailsPage.module.css';

export const ServicePoaDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const resourceId = id ?? '';
  const partyUuid = getCookie('AltinnPartyUuid') || '';
  const poaOverviewUrl = `/${amUIPath.PoaOverview}#singleRights`;
  // One zone for the whole page, so the users list can fall back to the page heading above it.
  const restoreFocus = useRestoreFocus();

  const {
    data: resource,
    isLoading,
    error,
  } = useGetResourceQuery(resourceId, { skip: !resourceId });

  useDocumentTitle(
    resource
      ? t('service_poa_details_page.page_title_service', { service: resource.title })
      : t('service_poa_details_page.page_title'),
  );

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={partyUuid}
          actingPartyUuid={partyUuid}
        >
          <Breadcrumbs
            items={['root', 'poa_overview']}
            lastBreadcrumb={{ label: resource?.title }}
          />
          <PageContainer backUrl={poaOverviewUrl}>
            {error ? (
              <DsAlert data-color='danger'>
                {t('service_poa_details_page.load_error')}{' '}
                <Link to={poaOverviewUrl}>
                  {t('service_poa_details_page.back_to_overview_link')}
                </Link>
              </DsAlert>
            ) : (
              <RestoreFocusProvider restoreFocus={restoreFocus}>
                <div className={classes.content}>
                  <ServicePoaDetailsHeader
                    resource={resource}
                    isLoading={isLoading}
                  />
                  <PageDivider />
                  <ServiceUsersSection
                    resource={resource}
                    isLoading={isLoading}
                  />
                </div>
              </RestoreFocusProvider>
            )}
          </PageContainer>
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
