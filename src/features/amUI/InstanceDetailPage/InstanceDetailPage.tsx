import { Navigate } from 'react-router';

import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { amUIPath } from '@/routes/paths/amUIPath';
import { poaOverviewPageEnabled } from '@/resources/utils/featureFlagUtils';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { InstanceDetailPageContent } from './InstanceDetailPageContent';
import { t } from 'i18next';

export const InstanceDetailPage = () => {
  const partyUuid = getCookie('AltinnPartyUuid') || '';

  useDocumentTitle(t('instance_detail_page.document_title'));

  if (!poaOverviewPageEnabled()) {
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
          <PageContainer backUrl={`/${amUIPath.PoaOverview}`}>
            <InstanceDetailPageContent />
          </PageContainer>
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
