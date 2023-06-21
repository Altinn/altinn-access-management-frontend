import * as React from 'react';
import { PersonCheckmarkIcon } from '@navikt/aksel-icons';

import { Page, PageHeader, PageContent, PageSize, PageContainer } from '@/components';
import { useMediaQuery } from '@/resources/hooks';

export const OverviewPage = () => {
  const isSm = useMediaQuery('(max-width: 768px)');

  return (
    <PageContainer>
      <Page size={isSm ? PageSize.Small : PageSize.Medium}>
        <PageHeader icon={<PersonCheckmarkIcon />}>EnkeltRettigheter</PageHeader>
        <PageContent></PageContent>
      </Page>
    </PageContainer>
  );
};
