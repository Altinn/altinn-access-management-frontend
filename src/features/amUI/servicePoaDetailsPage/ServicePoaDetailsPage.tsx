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
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { ServicePoaDetailsHeader } from './ServicePoaDetailsHeader';

export const ServicePoaDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const resourceId = id ?? '';
  const partyUuid = getCookie('AltinnPartyUuid') || '';
  const poaOverviewUrl = `/${amUIPath.PoaOverview}#singleRights`;

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
              <ServicePoaDetailsHeader
                resource={resource}
                isLoading={isLoading}
              />
            )}
          </PageContainer>
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
