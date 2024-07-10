import * as React from 'react';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

import { PageWrapper } from '@/components';
import { Heading, Pagination } from '@digdir/designsystemet-react';
import { useGetReporteeQuery } from '@/rtk/features/userInfo/userInfoApi';

import { UsersList } from './UsersList';

export const UsersPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('users_page.page_title'));

  const { data: reportee } = useGetReporteeQuery();

  return (
    <PageWrapper>
      <Heading
        level={1}
        spacing
      >
        {t('users_page.main_page_heading', { name: reportee?.name || '' })}
      </Heading>
      <UsersList />
    </PageWrapper>
  );
};
