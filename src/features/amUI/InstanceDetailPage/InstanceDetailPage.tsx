import { Navigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';

import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { amUIPath } from '@/routes/paths/amUIPath';
import { displayInstanceDelegation } from '@/resources/utils/featureFlagUtils';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { InstanceDetailPageContent } from './InstanceDetailPageContent';
import { InstanceDeeplinkGuard } from './InstanceDeeplinkGuard';

export const InstanceDetailPage = () => {
  const { t } = useTranslation();
  const partyUuid = getCookie('AltinnPartyUuid') || '';
  const [searchParams] = useSearchParams();
  const isInboxDeeplink = !!searchParams.get('dialogId');
  const instanceDelegationEnabled = displayInstanceDelegation();

  useDocumentTitle(t('instance_detail_page.document_title'));

  if (!instanceDelegationEnabled) {
    return (
      <Navigate
        to='/not-found'
        replace
      />
    );
  }

  return (
    <PageWrapper>
      <PageLayoutWrapper hideSidebar={isInboxDeeplink}>
        <InstanceDeeplinkGuard backUrl={isInboxDeeplink ? undefined : `/${amUIPath.PoaOverview}`}>
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
