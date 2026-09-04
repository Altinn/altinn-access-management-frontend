import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDisplayName } from '@altinn/altinn-components';

import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { ReporteePageHeading } from '../common/ReporteePageHeading';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';

import { UsersList } from './UsersList';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

export const UsersPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('users_page.page_title'));

  const { data: reportee, isLoading } = useGetReporteeQuery();
  const name = formatDisplayName({
    fullName: reportee?.name || '',
    type: reportee?.type === 'Person' ? 'person' : 'company',
  });

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
        >
          <Breadcrumbs items={['root', 'users']} />
          <ReporteePageHeading
            title={t('users_page.main_page_heading', { name })}
            reportee={reportee}
            isLoading={isLoading}
            downloadable
          />
          <UsersList />
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
