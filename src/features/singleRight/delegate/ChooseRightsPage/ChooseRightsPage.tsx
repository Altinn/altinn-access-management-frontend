import * as React from 'react';
import { PageHeader } from '@altinn/altinn-design-system';
import { useTranslation } from 'react-i18next';
import { PersonIcon } from '@navikt/aksel-icons';

import { Page, PageContainer, PageContent } from '@/components';

export const ChooseRightsPage = () => {
  const { t } = useTranslation('common');

  return (
    <PageContainer>
      <Page>
        <PageHeader icon={<PersonIcon />}>{t('single_rights.delegate_single_rights')}</PageHeader>
        <PageContent></PageContent>
      </Page>
    </PageContainer>
  );
};
