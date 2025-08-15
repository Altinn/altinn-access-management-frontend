import { DsAlert, DsHeading } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import React from 'react';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetIsAdminQuery, useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import classes from './ReporteePage.module.css';
import { ReporteesList } from './ReporteesList';

export const ReporteesPage = () => {
  const { t } = useTranslation();
  const { data: isAdmin, isLoading } = useGetIsAdminQuery();
  const { data: reportee } = useGetReporteeQuery();
  const name = reportee?.name || '';
  const orgNumber = reportee?.organizationNumber || '';
  const isMainUnit = (reportee?.subunits?.length ?? 0) > 0;

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
            fromPartyUuid={getCookie('AltinnPartyUuid')}
            actingPartyUuid={getCookie('AltinnPartyUuid')}
          >
            <div className={classes.reporteeListHeading}>
              <DsHeading
                level={1}
                data-size='sm'
              >
                {t('reportees_page.main_page_heading', { name: name || '' })}
                <br />
                {t('users_page.sub_heading', { org_number: orgNumber || '' })}{' '}
                {isMainUnit ? `(${t('common.mainunit_lowercase')})` : ''}
              </DsHeading>
            </div>
            <ReporteesList />
          </PartyRepresentationProvider>
        )}
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
