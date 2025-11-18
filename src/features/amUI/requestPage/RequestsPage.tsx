import { PageWrapper } from '@/components';
import React from 'react';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { useRerouteIfRequestPageDisabled } from '@/resources/utils/featureFlagUtils';

export const RequestPage = () => {
  useRerouteIfRequestPageDisabled();

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <div>Forespørsel-siden er under arbeid</div>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
