import { Navigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DsButton } from '@altinn/altinn-components';
import { EnvelopeClosedIcon } from '@navikt/aksel-icons';

import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { amUIPath } from '@/routes/paths/amUIPath';
import { displayInstanceDelegation } from '@/resources/utils/featureFlagUtils';
import { getAfUrl } from '@/resources/utils/pathUtils';

import { DeeplinkReporteeGuard } from '../common/DeeplinkReporteeGuard/DeeplinkReporteeGuard';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { InstanceDetailPageContent } from './InstanceDetailPageContent';
import classes from './InstanceDetailPageContent.module.css';

const getInboxUrl = (dialogId: string) => `${getAfUrl()}inbox/${encodeURIComponent(dialogId)}`;

export const InstanceDetailPage = () => {
  const { t } = useTranslation();
  const partyUuid = getCookie('AltinnPartyUuid') || '';
  const [searchParams] = useSearchParams();
  const dialogId = searchParams.get('dialogId');
  const isInboxDeeplink = !!dialogId;
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

  const inboxLink = dialogId ? (
    <div className={classes.inboxLinkContainer}>
      <DsButton
        asChild
        variant='secondary'
        className={classes.inboxButton}
      >
        <a href={getInboxUrl(dialogId)}>
          <EnvelopeClosedIcon />
          {t('instance_detail_page.back_to_inbox')}
        </a>
      </DsButton>
    </div>
  ) : null;

  return (
    <PageWrapper>
      <PageLayoutWrapper hideSidebar={isInboxDeeplink}>
        <PageContainer
          backUrl={isInboxDeeplink ? getInboxUrl(dialogId) : `/${amUIPath.PoaOverview}`}
        >
          <DeeplinkReporteeGuard fallbackContent={inboxLink}>
            <PartyRepresentationProvider
              fromPartyUuid={partyUuid}
              actingPartyUuid={partyUuid}
            >
              <InstanceDetailPageContent />
            </PartyRepresentationProvider>
          </DeeplinkReporteeGuard>
        </PageContainer>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
