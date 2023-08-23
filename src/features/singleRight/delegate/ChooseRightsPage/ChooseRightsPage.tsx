import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { PersonIcon } from '@navikt/aksel-icons';

import { Page, PageContainer, PageContent, PageHeader } from '@/components';

export const ChooseRightsPage = () => {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <Page color='light'>
        <PageHeader icon={<PersonIcon />}>{t('single_rights.delegate_single_rights')}</PageHeader>
        <PageContent></PageContent>
      </Page>
    </PageContainer>
  );
};
