import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetDelegatedResourcesByFromOrToQuery } from '@/rtk/features/singleRights/singleRightsApi';
import { amUIPath } from '@/routes/paths/amUIPath';
import { poaOverviewPageEnabled } from '@/resources/utils/featureFlagUtils';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PageContainer } from '../common/PageContainer/PageContainer';
import {
  PartyRepresentationProvider,
  usePartyRepresentation,
} from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { ServicePoaDetails } from './ServicePoaDetails';

export const ServicePoaDetailsPage = () => {
  const { t } = useTranslation();

  useDocumentTitle(t('service_poa_details_page.page_title'));

  const partyUuid = getCookie('AltinnPartyUuid') || '';

  const pageIsEnabled = poaOverviewPageEnabled();
  if (!pageIsEnabled) {
    return (
      <Navigate
        to='/not-found'
        replace
      />
    );
  }

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={partyUuid}
          actingPartyUuid={partyUuid}
          returnToUrlOnError={`/${amUIPath.PoaOverview}#singleRights`}
        >
          <BreadcrumbsWrapper />
          <PageContainer backUrl={`/${amUIPath.PoaOverview}#singleRights`}>
            <ServicePoaDetails />
          </PageContainer>
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

const BreadcrumbsWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const { fromParty, actingParty } = usePartyRepresentation();
  const serviceIdentifier = decodeURIComponent(id ?? '');

  const { data: delegatedResources } = useGetDelegatedResourcesByFromOrToQuery(
    {
      actingParty: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
      to: '',
    },
    {
      skip: !actingParty?.partyUuid || !fromParty?.partyUuid || !serviceIdentifier,
    },
  );

  const serviceTitle = useMemo(
    () =>
      delegatedResources?.find(
        (delegation) => delegation.resource?.identifier === serviceIdentifier,
      )?.resource?.title ?? serviceIdentifier,
    [delegatedResources, serviceIdentifier],
  );

  return (
    <Breadcrumbs
      items={['root', 'poa_overview']}
      lastBreadcrumb={{ label: serviceTitle }}
    />
  );
};
