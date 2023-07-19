import * as React from 'react';
import { PersonCheckmarkIcon } from '@navikt/aksel-icons';
import axios from 'axios';

import { Page, PageHeader, PageContent, PageSize, PageContainer } from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import { DelegationRequestDto } from '@/dataObjects/dtos/CheckDelegationAccessDto';

export const ChooseServicePage = () => {
  const isSm = useMediaQuery('(max-width: 768px)');

  const checkDelegationAccess = () => {
    const dto = new DelegationRequestDto('urn:altinn:resource', 'testapi');

    axios
      .post(`/accessmanagement/api/v1/singleright/checkdelegationaccesses/${1232131234}`, dto)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        throw error;
      });
  };

  checkDelegationAccess();

  return (
    <PageContainer>
      <Page size={isSm ? PageSize.Small : PageSize.Medium}>
        <PageHeader icon={<PersonCheckmarkIcon />}>EnkeltRettigheter</PageHeader>
        <PageContent></PageContent>
      </Page>
    </PageContainer>
  );
};
