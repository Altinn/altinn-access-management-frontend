import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph, DsSkeleton } from '@altinn/altinn-components';
import { useSearchParams } from 'react-router';

import { getCookie } from '@/resources/Cookie/CookieMethods';

import { PageContainer } from '../PageContainer/PageContainer';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import { getRequestedPartyUuid, useDeeplinkReporteeGuard } from './useDeeplinkReporteeGuard';

interface DeeplinkReporteeGuardProps {
  children: ReactNode;
  backUrl?: string;
  /** Optional content rendered below error/unauthorized alerts (e.g. a fallback navigation link) */
  fallbackAction?: ReactNode;
}

export const DeeplinkReporteeGuard = ({
  children,
  backUrl,
  fallbackAction,
}: DeeplinkReporteeGuardProps) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const actingPartyUuid = getCookie('AltinnPartyUuid');
  const requestedPartyUuid = getRequestedPartyUuid(searchParams);
  const deeplinkGuard = useDeeplinkReporteeGuard({ actingPartyUuid, requestedPartyUuid });

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
            {t('common.reportee_access_missing_title')}
          </DsHeading>
        </DsAlert>
        {fallbackAction}
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
        {fallbackAction}
      </PageContainer>
    );
  }

  return <PageContainer backUrl={backUrl}>{children}</PageContainer>;
};
