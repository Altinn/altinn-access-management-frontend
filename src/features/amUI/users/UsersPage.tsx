import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading } from '@digdir/designsystemet-react';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetReporteeQuery } from '@/rtk/features/userInfo/userInfoApi';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';

import { UsersList } from './UsersList';
import classes from './UsersList.module.css';

export const UsersPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('users_page.page_title'));
  const { data: reportee } = useGetReporteeQuery();

  return (
    <PageWrapper>
      <PageLayoutWrapper reporteeName={reportee?.name || ''}>
        <Heading
          level={1}
          size='md'
          className={classes.usersListHeading}
        >
          {t('users_page.main_page_heading', { name: reportee?.name || '' })}
        </Heading>
        <UsersList />
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
