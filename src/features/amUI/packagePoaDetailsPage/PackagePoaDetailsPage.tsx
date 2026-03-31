import React from 'react';
import { DsHeading } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import {
  PartyRepresentationProvider,
  usePartyRepresentation,
} from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { poaOverviewPageEnabled } from '@/resources/utils/featureFlagUtils';

import { PackagePoaDetails } from './PackagePoaDetails';
import { Navigate, useParams, useSearchParams } from 'react-router';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { useGetPackagePermissionDetailsQuery } from '@/rtk/features/accessPackageApi';
import { amUIPath } from '@/routes/paths/amUIPath';

export const PackagePoaDetailsPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const poaOverviewUrl = `/${amUIPath.PoaOverview}${tab ? `?tab=${encodeURIComponent(tab)}` : ''}`;

  useDocumentTitle(t('package_poa_details_page.page_title'));

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
        >
          <BreadcrumbsWrapper />
          <PageContainer backUrl={poaOverviewUrl}>
            <PackagePoaDetails />
          </PageContainer>
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

const BreadcrumbsWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const { fromParty } = usePartyRepresentation();

  const { data: accessPackage } = useGetPackagePermissionDetailsQuery(
    {
      from: fromParty?.partyUuid ?? '',
      packageId: id || '',
      language: i18n.language,
    },
    { skip: !id || !fromParty?.partyUuid },
  );

  return (
    <Breadcrumbs
      items={['root', 'poa_overview']}
      lastBreadcrumb={{ label: accessPackage?.name }}
    />
  );
};
