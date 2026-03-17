import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsButton, DsHeading, DsParagraph, DsSkeleton } from '@altinn/altinn-components';
import { EnvelopeClosedIcon } from '@navikt/aksel-icons';
import { useSearchParams } from 'react-router';

import { getCookie } from '@/resources/Cookie/CookieMethods';

import { PageContainer } from '../common/PageContainer/PageContainer';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import {
  getInboxUrlForDialogId,
  getRequestedPartyUuid,
  useInstanceDeeplinkReporteeGuard,
} from './useInstanceDeeplinkReporteeGuard';
import classes from './InstanceDetailPageContent.module.css';

interface InstanceDeeplinkGuardProps {
  children: ReactNode;
  backUrl: string;
}

export const InstanceDeeplinkGuard = ({ children, backUrl }: InstanceDeeplinkGuardProps) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const actingPartyUuid = getCookie('AltinnPartyUuid');
  const requestedPartyUuid = getRequestedPartyUuid(searchParams);
  const inboxUrl = getInboxUrlForDialogId(searchParams.get('dialogId'));
  const deeplinkGuard = useInstanceDeeplinkReporteeGuard({ actingPartyUuid, requestedPartyUuid });

  const inboxLink = (
    <div className={classes.inboxLinkContainer}>
      <DsButton
        asChild
        variant='secondary'
        className={classes.inboxButton}
      >
        <a href={inboxUrl}>
          <EnvelopeClosedIcon />
          {t('instance_detail_page.back_to_inbox')}
        </a>
      </DsButton>
    </div>
  );

  if (deeplinkGuard.status === 'loading' || deeplinkGuard.status === 'redirecting') {
    return (
      <PageContainer backUrl={backUrl}>
        <DsSkeleton
          width='100%'
          height='200px'
          aria-label={t('common.loading')}
        />
      </PageContainer>
    );
  }

  if (deeplinkGuard.status === 'unauthorized') {
    return (
      <PageContainer backUrl={backUrl}>
        <DsAlert data-color='warning'>
          <DsHeading
            level={2}
            data-size='xs'
          >
            {t('instance_detail_page.reportee_access_missing_title')}
          </DsHeading>
        </DsAlert>
        {inboxLink}
      </PageContainer>
    );
  }

  if (deeplinkGuard.status === 'error') {
    const technicalError = createErrorDetails(deeplinkGuard.error);

    return (
      <PageContainer backUrl={backUrl}>
        <DsAlert data-color='danger'>
          <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
          {technicalError && (
            <TechnicalErrorParagraphs
              size='sm'
              status={technicalError.status}
              time={technicalError.time}
              traceId={technicalError.traceId}
            />
          )}
        </DsAlert>
        {inboxLink}
      </PageContainer>
    );
  }

  return <PageContainer backUrl={backUrl}>{children}</PageContainer>;
};
