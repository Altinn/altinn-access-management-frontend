import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import {
  PartyRepresentationProvider,
  usePartyRepresentation,
} from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';

import { PackagePoaDetails } from './PackagePoaDetails';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetPackagePermissionDetailsQuery } from '@/rtk/features/accessPackageApi';
import { amUIPath } from '@/routes/paths/amUIPath';

export const PackagePoaDetailsPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const parentTab = searchParams.get('parentTab') ?? 'packages';
  const poaOverviewUrl = `/${amUIPath.PoaOverview}#${parentTab}`;
  const partyUuid = getCookie('AltinnPartyUuid') || '';

  useDocumentTitle(t('package_poa_details_page.page_title'));

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
