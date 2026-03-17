import { Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { amUIPath } from '@/routes/paths/amUIPath';
import { poaOverviewPageEnabled } from '@/resources/utils/featureFlagUtils';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { InstanceDetailPageContent } from './InstanceDetailPageContent';
import { InstanceDeeplinkGuard } from './InstanceDeeplinkGuard';

export const InstanceDetailPage = () => {
  const { t } = useTranslation();
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
        <InstanceDeeplinkGuard backUrl={`/${amUIPath.PoaOverview}`}>
          <PartyRepresentationProvider
            fromPartyUuid={partyUuid}
            actingPartyUuid={partyUuid}
          >
            <InstanceDetailPageContent />
          </PartyRepresentationProvider>
        </InstanceDeeplinkGuard>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
