import { DsAlert, DsHeading, formatDisplayName } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import React from 'react';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetIsAdminQuery, useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ReporteePageHeading } from '../common/ReporteePageHeading';

import { ReporteesList } from './ReporteesList';

export const ReporteesPage = () => {
  const { t } = useTranslation();
  const { data: isAdmin, isLoading } = useGetIsAdminQuery();
  const { data: reportee, isLoading: reporteeLoading } = useGetReporteeQuery();
  const name = formatDisplayName({
    fullName: reportee?.name || '',
    type: reportee?.type === 'Person' ? 'person' : 'company',
  });

  useDocumentTitle(t('reportees_page.page_title'));

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        {!isLoading && !isAdmin ? (
          <DsAlert data-color='warning'>
            {t('reportees_page.not_admin_alert', { name: name || '' })}
          </DsAlert>
        ) : (
          <PartyRepresentationProvider
            toPartyUuid={getCookie('AltinnPartyUuid')}
            actingPartyUuid={getCookie('AltinnPartyUuid')}
          >
            <ReporteePageHeading
              title={t('reportees_page.main_page_heading', { name })}
              reportee={reportee}
              isLoading={reporteeLoading}
            />
            <ReporteesList />
          </PartyRepresentationProvider>
        )}
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
