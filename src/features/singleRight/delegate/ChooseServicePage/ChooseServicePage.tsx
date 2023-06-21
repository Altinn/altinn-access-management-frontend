import * as React from 'react';
import { PersonCheckmarkIcon } from '@navikt/aksel-icons';
import axios from 'axios';
import { Button, ButtonVariant } from '@digdir/design-system-react';

import { Page, PageHeader, PageContent, PageSize, PageContainer } from '@/components';
import { useMediaQuery } from '@/resources/hooks';

export const ChooseServicePage = () => {
  const isSm = useMediaQuery('(max-width: 768px)');

  const testEndpoint = () => {
    axios
      .post(`/accessmanagement/api/v1/singleright/checkdelegationaccesses/${1232131234}`, {
        to: [
          {
            id: 'urn:altinn:organizationnumber',
            value: String(123456789),
          },
        ],
        resources: [
          {
            id: 'urn:altinn:resource',
            value: String('testaopi'),
          },
        ],
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        throw error;
      });
  };

  return (
    <PageContainer>
      <Page size={isSm ? PageSize.Small : PageSize.Medium}>
        <PageHeader icon={<PersonCheckmarkIcon />}>EnkeltRettigheter</PageHeader>
        <PageContent>
          <Button
            variant={ButtonVariant.Outline}
            onClick={testEndpoint}
          >
            Test API
          </Button>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
