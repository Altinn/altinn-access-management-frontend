import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph, DsSkeleton } from '@altinn/altinn-components';
import { useSearchParams } from 'react-router';

import { getCookie } from '@/resources/Cookie/CookieMethods';

import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import styles from './DeeplinkReporteeGuard.module.css';
import { useReporteeGuard } from './useReporteeGuard';

interface DeeplinkReporteeGuardProps {
  children: ReactNode;
  /** Optional content rendered below error/unauthorized alerts (e.g. a fallback navigation link) */
  fallbackContent?: ReactNode;
}

export const getRequestedPartyUuid = (searchParams: URLSearchParams) =>
  searchParams.get('partyUuid') ?? '';

export const DeeplinkReporteeGuard = ({
  children,
  fallbackContent,
}: DeeplinkReporteeGuardProps) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const actingPartyUuid = getCookie('AltinnPartyUuid');
  const requestedPartyUuid = getRequestedPartyUuid(searchParams);
  const reporteeGuard = useReporteeGuard({ actingPartyUuid, requestedPartyUuid });

  if (reporteeGuard.status === 'loading' || reporteeGuard.status === 'redirecting') {
    return (
      <DsSkeleton
        width='100%'
        height='200px'
        aria-label={t('common.loading')}
      />
    );
  }

  if (reporteeGuard.status === 'unauthorized') {
    return (
      <div className={styles.alertWithFallback}>
        <DsAlert data-color='warning'>
          <DsHeading
            level={2}
            data-size='xs'
          >
            {t('common.reportee_access_missing_title')}
          </DsHeading>
        </DsAlert>
        {fallbackContent}
      </div>
    );
  }

  if (reporteeGuard.status === 'error') {
    const technicalError = createErrorDetails(reporteeGuard.error);

    return (
      <div className={styles.alertWithFallback}>
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
        {fallbackContent}
      </div>
    );
  }

  return <>{children}</>;
};
