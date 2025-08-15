import React from 'react';
import { DsHeading } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { RightsTabs } from '../common/RightsTabs/RightsTabs';
import { PoaOverviewList } from './PoaOverviewList';

export const PoaOverviewPage = () => {
  const { t } = useTranslation();
  const { data: reportee } = useGetReporteeQuery();
  useDocumentTitle(t('poa_overview_page.page_title'));

  // rerouteIfNotLimitedPreview();

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
        >
          <DsHeading
            level={1}
            data-size='lg'
          >
            {t('poa_overview_page.heading', { fromparty: reportee?.name || '' })}
          </DsHeading>
          <RightsTabs
            packagesPanel={<PoaOverviewList />}
            singleRightsPanel={'Kommer snart'}
            roleAssignmentsPanel={'Kommer snart'}
          />
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
