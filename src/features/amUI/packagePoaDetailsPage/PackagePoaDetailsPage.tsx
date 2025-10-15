import React from 'react';
import { DsHeading } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import {
  poaOverviewPageEnabled,
  useRerouteIfLimitedPreview,
} from '@/resources/utils/featureFlagUtils';

import { PackagePoaDetails } from './PackagePoaDetails';
import { amUIPath } from '@/routes/paths/amUIPath';
import { useNavigate } from 'react-router';

export const PackagePoaDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useDocumentTitle(t('package_poa_details_page.page_title'));

  const partyUuid = getCookie('AltinnPartyUuid') || '';

  const pageIsEnabled = poaOverviewPageEnabled();
  if (!pageIsEnabled) {
    navigate('/not-found', { replace: true });
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
