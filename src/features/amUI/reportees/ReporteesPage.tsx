import { DsAlert, DsHeading, formatDisplayName } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import React from 'react';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetIsAdminQuery, useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { useGetPartyFromLoggedInUserQuery } from '@/rtk/features/lookupApi';
import { hasReporteeListAdminAccess } from '@/resources/utils/permissionUtils';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ReporteePageHeading } from '../common/ReporteePageHeading';

import { ReporteesList } from './ReporteesList';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';

export const ReporteesPage = () => {
  const { t } = useTranslation();
  const { data: isAdmin, isLoading } = useGetIsAdminQuery();
  const { data: reportee, isLoading: reporteeLoading } = useGetReporteeQuery();
  const { data: currentUser, isLoading: currentUserIsLoading } = useGetPartyFromLoggedInUserQuery();
  const isCurrentUserReportee = reportee?.partyUuid === currentUser?.partyUuid;
  const name = formatDisplayName({
    fullName: reportee?.name || '',
    type: reportee?.type === 'Person' ? 'person' : 'company',
  });

  useDocumentTitle(t('reportees_page.page_title'));

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        {!isLoading &&
        !reporteeLoading &&
        !currentUserIsLoading &&
        !hasReporteeListAdminAccess(reportee, isAdmin, isCurrentUserReportee) ? (
          <DsAlert data-color='warning'>
            {t('reportees_page.not_admin_alert', { name: name || '' })}
          </DsAlert>
        ) : (
          <PartyRepresentationProvider
            toPartyUuid={getCookie('AltinnPartyUuid')}
            actingPartyUuid={getCookie('AltinnPartyUuid')}
          >
            <Breadcrumbs items={['root', 'reportees']} />
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
