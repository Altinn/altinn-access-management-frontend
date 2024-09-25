import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading } from '@digdir/designsystemet-react';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetReporteeQuery } from '@/rtk/features/userInfo/userInfoApi';

import { FakePageWrapper } from '../common/FakePageWrapper';

import { UsersList } from './UsersList';

export const UsersPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('users_page.page_title'));
  const { data: reportee } = useGetReporteeQuery();

  return (
    <PageWrapper>
      <FakePageWrapper reporteeName={reportee?.name || ''}>
        <Heading
          level={1}
          size='md'
          spacing
        >
          {t('users_page.main_page_heading', { name: reportee?.name || '' })}
        </Heading>
        <UsersList />
      </FakePageWrapper>
    </PageWrapper>
  );
};
