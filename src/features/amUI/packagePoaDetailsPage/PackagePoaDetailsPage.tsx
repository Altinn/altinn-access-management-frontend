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
import { amUIPath } from '@/routes/paths/amUIPath';
import { Navigate, useParams } from 'react-router';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { useGetPackagePermissionDetailsQuery } from '@/rtk/features/accessPackageApi';

export const PackagePoaDetailsPage = () => {
  const { t } = useTranslation();

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
          returnToUrlOnError={`/${amUIPath.PoaOverview}`}
        >
          <BreadcrumbsWrapper />
          <PageContainer backUrl={`/${amUIPath.PoaOverview}`}>
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
