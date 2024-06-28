import * as React from 'react';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

import { PageWrapper } from '@/components';

export const UsersPage = () => {
  const { t } = useTranslation('common');
  useDocumentTitle(t('users_page.page_title'));
  return <PageWrapper>Hello world!</PageWrapper>;
};
