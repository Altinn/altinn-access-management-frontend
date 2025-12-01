import { PageWrapper } from '@/components';
import React from 'react';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { useRerouteIfRequestPageDisabled } from '@/resources/utils/featureFlagUtils';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';

export const RequestPage = () => {
  useRerouteIfRequestPageDisabled();

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <Breadcrumbs items={['root', 'requests']} />
        <div>Forespørsel-siden er under arbeid</div>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
