import React from 'react';
import { DsHeading } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { useRerouteIfLimitedPreview } from '@/resources/utils/featureFlagUtils';

import { PackagePoaDetails } from './PackagePoaDetails';
import { amUIPath } from '@/routes/paths/amUIPath';
import { Navigate } from 'react-router';

export const PackagePoaDetailsPage = () => {
  const { t } = useTranslation();

  useDocumentTitle(t('package_poa_details_page.page_title'));

  const partyUuid = getCookie('AltinnPartyUuid') || undefined;

  useRerouteIfLimitedPreview();

  // Redirect to overview if cookie is missing to satisfy provider invariants
  if (!partyUuid) {
    return (
      <Navigate
        to={`/${amUIPath.PoaOverview}`}
        replace
      />
    );
  }

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PageContainer backUrl={`/${amUIPath.PoaOverview}`}>
          <PartyRepresentationProvider
            fromPartyUuid={partyUuid}
            actingPartyUuid={partyUuid}
            returnToUrlOnError={`/${amUIPath.PoaOverview}`}
          >
            <PackagePoaDetails />
          </PartyRepresentationProvider>
        </PageContainer>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
