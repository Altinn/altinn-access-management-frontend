import React from 'react';
import { DsHeading } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { poaOverviewPageEnabled } from '@/resources/utils/featureFlagUtils';

import { PackagePoaDetails } from './PackagePoaDetails';
import { amUIPath } from '@/routes/paths/amUIPath';
import { Navigate } from 'react-router';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';

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
          <Breadcrumbs />
          <PageContainer backUrl={`/${amUIPath.PoaOverview}`}>
            <PackagePoaDetails />
          </PageContainer>
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
