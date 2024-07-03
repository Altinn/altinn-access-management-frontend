import * as React from 'react';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

import { PageWrapper } from '@/components';
import { useGetReporteeQuery } from '@/rtk/features/userInfo/userInfoApi';
import { Heading } from '@digdir/designsystemet-react';

export const UsersPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('users_page.page_title'));

  const { data } = useGetReporteeQuery();

  return (
    <PageWrapper>
      <Heading level={1}>{t('users_page.main_page_heading', { name: data?.name || '' })}</Heading>
    </PageWrapper>
  );
};
