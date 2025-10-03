import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DsHeading } from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { useRerouteIfNotConfetti } from '@/resources/utils/featureFlagUtils';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';

import { UsersList } from './UsersList';
import classes from './UsersList.module.css';
import { ReporteePageHeading } from '../common/ReporteePageHeading';

export const UsersPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('users_page.page_title'));

  const { data: reportee, isLoading } = useGetReporteeQuery();
  const name = reportee?.name || '';

  useRerouteIfNotConfetti();

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
        >
          <ReporteePageHeading
            title={t('users_page.main_page_heading', { name })}
            reportee={reportee}
            isLoading={isLoading}
          />
          <UsersList />
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
