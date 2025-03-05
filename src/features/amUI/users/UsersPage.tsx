import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading } from '@digdir/designsystemet-react';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';

import { UsersList } from './UsersList';
import classes from './UsersList.module.css';
import { rerouteIfNotConfetti } from '@/resources/utils/featureFlagUtils';

export const UsersPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('users_page.page_title'));
  const { data: reportee } = useGetReporteeQuery();

  rerouteIfNotConfetti();

  return (
    <PageWrapper>
      <PageLayoutWrapper>
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
